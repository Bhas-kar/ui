// src/components/Contribute/Knowledge/Github/index.tsx
'use client';
import React, { useEffect, useState } from 'react';
import '../knowledge.css';
import { useSession } from 'next-auth/react';
import AuthorInformation from '@/components/Contribute/AuthorInformation';
import KnowledgeInformation from '@/components/Contribute/Knowledge/KnowledgeInformation/KnowledgeInformation';
import FilePathInformation from '@/components/Contribute/Knowledge/FilePathInformation/FilePathInformation';
import DocumentInformation from '@/components/Contribute/Knowledge/DocumentInformation/DocumentInformation';
import SeedExamples from '@/components/Contribute/Knowledge/SeedExamples/SeedExamples';
import { KnowledgeEditFormData, KnowledgeFormData, KnowledgeYamlData } from '@/types';
import { useRouter } from 'next/navigation';
import { autoFillKnowledgeFields } from '@/components/Contribute/Knowledge/AutoFill';
import ReviewSubmission from '../ReviewSubmission';
import { YamlFileUploadModal } from '../../YamlFileUploadModal';
import {
  ValidatedOptions,
  PageGroup,
  PageBreadcrumb,
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
  Flex,
  FlexItem,
  Title,
  Button,
  Content,
  Wizard,
  WizardStep
} from '@patternfly/react-core';
import { devLog } from '@/utils/devlog';
import { ActionGroupAlertContent } from '@/components/Contribute/types';
import KnowledgeWizardFooter from '@/components/Contribute/Knowledge/KnowledgeWizardFooter/KnowledgeWizardFooter';
import { addDocumentInfoToKnowledgeFormData } from '@/components/Contribute/Knowledge/documentUtils';
import { addYamlUploadKnowledge } from '@/components/Contribute/Knowledge/uploadUtils';
import { createEmptySeedExample } from '@/components/Contribute/Knowledge/seedExampleUtils';
import {
  isAuthInfoValid,
  isDocumentInfoValid,
  isFilePathInfoValid,
  isKnowledgeInfoValid,
  isSeedExamplesValid
} from '@/components/Contribute/Knowledge/validationUtils';
import ContributeAlertGroup from '@/components/Contribute/ContributeAlertGroup';
import {
  submitGithubKnowledgeData,
  submitNativeKnowledgeData,
  updateGithubKnowledgeData,
  updateNativeKnowledgeData
} from '@/components/Contribute/Knowledge/submitUtils';
import { getGitHubUserInfo } from '@/utils/github';
import AttributionInformation from '@/components/Contribute/Knowledge/AttributionInformation/AttributionInformation';

const DefaultKnowledgeFormData: KnowledgeFormData = {
  email: '',
  name: '',
  submissionSummary: '',
  domain: '',
  documentOutline: '',
  filePath: '',
  seedExamples: [createEmptySeedExample(), createEmptySeedExample(), createEmptySeedExample(), createEmptySeedExample(), createEmptySeedExample()],
  knowledgeDocumentRepositoryUrl: '',
  knowledgeDocumentCommit: '',
  documentName: '',
  titleWork: '',
  linkWork: '',
  revision: '',
  licenseWork: '',
  creators: ''
};

export interface KnowledgeFormProps {
  knowledgeEditFormData?: KnowledgeEditFormData;
  isGithubMode: boolean;
}

const STEP_IDS = ['author-info', 'knowledge-info', 'file-path-info', 'document-info', 'seed-examples', 'attribution-info', 'review-submission'];

export const KnowledgeWizard: React.FunctionComponent<KnowledgeFormProps> = ({ knowledgeEditFormData, isGithubMode }) => {
  const [devModeEnabled, setDevModeEnabled] = useState<boolean | undefined>();
  const { data: session } = useSession();
  const [knowledgeFormData, setKnowledgeFormData] = React.useState<KnowledgeFormData>(
    knowledgeEditFormData?.knowledgeFormData || DefaultKnowledgeFormData
  );
  const [githubUsername, setGithubUsername] = useState<string>('');
  const [actionGroupAlertContent, setActionGroupAlertContent] = useState<ActionGroupAlertContent | undefined>();
  const [isYamlModalOpen, setIsYamlModalOpen] = useState<boolean>(false); // **New State Added**
  const [submitEnabled, setSubmitEnabled] = useState<boolean>(false); // **New State Added**
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const router = useRouter();

  useEffect(() => {
    const getEnvVariables = async () => {
      const res = await fetch('/api/envConfig');
      const envConfig = await res.json();
      setDevModeEnabled(envConfig.ENABLE_DEV_MODE === 'true');
    };
    getEnvVariables();
  }, []);

  useEffect(() => {
    if (isGithubMode) {
      const fetchUserInfo = async () => {
        if (session?.accessToken) {
          try {
            const headers = {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28'
            };
            const fetchedUserInfo = await getGitHubUserInfo(headers);
            setGithubUsername(fetchedUserInfo.login);
            setKnowledgeFormData((prev) => ({
              ...prev,
              name: fetchedUserInfo.name,
              email: fetchedUserInfo.email
            }));
          } catch (error) {
            console.error('Failed to fetch GitHub user info:', error);
          }
        }
      };
      fetchUserInfo();
    }
  }, [isGithubMode, session?.accessToken, session?.user]);

  useEffect(() => {
    // Set all elements from the knowledgeFormData to the state
    if (knowledgeEditFormData) {
      setKnowledgeFormData({
        ...knowledgeEditFormData.knowledgeFormData,
        seedExamples: knowledgeEditFormData.knowledgeFormData.seedExamples.map((example) => ({
          ...example,
          immutable: example.immutable !== undefined ? example.immutable : true, // Ensure immutable is set
          isContextValid: example.isContextValid || ValidatedOptions.default,
          validationError: example.validationError || '',
          questionAndAnswers: example.questionAndAnswers.map((qa) => ({
            ...qa,
            immutable: qa.immutable !== undefined ? qa.immutable : true, // Ensure immutable is set
            isQuestionValid: qa.isQuestionValid || ValidatedOptions.default,
            questionValidationError: qa.questionValidationError || '',
            isAnswerValid: qa.isAnswerValid || ValidatedOptions.default,
            answerValidationError: qa.answerValidationError || ''
          }))
        }))
      });

      devLog('Seed Examples Set from Edit Form Data:', knowledgeEditFormData.knowledgeFormData.seedExamples);
    }
  }, [knowledgeEditFormData]);

  // Function to append document information (Updated for single repositoryUrl and commitSha)
  // Within src/components/Contribute/Native/index.tsx
  const addDocumentInfoHandler = React.useCallback(
    (repoUrl: string, commitShaValue: string, docName: string) => {
      devLog(`addDocumentInfoHandler: repoUrl=${repoUrl}, commitSha=${commitShaValue}, docName=${docName}`);
      if (knowledgeFormData.knowledgeDocumentCommit && commitShaValue !== knowledgeFormData.knowledgeDocumentCommit) {
        console.error('Cannot add documents from different commit SHAs.');
        setActionGroupAlertContent({
          title: 'Invalid Selection',
          message: 'All documents must be from the same commit SHA.',
          success: false
        });
        return;
      }
      setKnowledgeFormData((prev) => addDocumentInfoToKnowledgeFormData(prev, repoUrl, commitShaValue, docName));
    },
    [knowledgeFormData.knowledgeDocumentCommit]
  );

  const onCloseActionGroupAlert = () => {
    setActionGroupAlertContent(undefined);
  };

  const autoFillForm = (): void => {
    setKnowledgeFormData({
      ...autoFillKnowledgeFields,
      knowledgeDocumentRepositoryUrl: '~/.instructlab-ui/taxonomy-knowledge-docs'
    });
  };
  const onYamlUploadKnowledgeFillForm = (data: KnowledgeYamlData): void => {
    setKnowledgeFormData((prev) => addYamlUploadKnowledge(prev, data));
    setActionGroupAlertContent({
      title: 'YAML Uploaded Successfully',
      message: 'Your knowledge form has been populated based on the uploaded YAML file.',
      success: true
    });
  };

  useEffect(() => {
    devLog('Seed Examples Updated:', knowledgeFormData.seedExamples);
  }, [knowledgeFormData.seedExamples]);

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const steps: { id: string; name: string; component: React.ReactNode; status?: 'default' | 'error' }[] = React.useMemo(
    () => [
      {
        id: STEP_IDS[0],
        name: 'Author Information',
        component: (
          <AuthorInformation
            email={knowledgeFormData.email}
            setEmail={(email) => setKnowledgeFormData((prev) => ({ ...prev, email }))}
            name={knowledgeFormData.name}
            setName={(name) => setKnowledgeFormData((prev) => ({ ...prev, name }))}
          />
        ),
        status: isAuthInfoValid(knowledgeFormData) ? 'default' : 'error'
      },
      {
        id: STEP_IDS[1],
        name: 'Knowledge Information',
        component: (
          <KnowledgeInformation
            isEditForm={knowledgeEditFormData?.isEditForm}
            submissionSummary={knowledgeFormData.submissionSummary}
            setSubmissionSummary={(submissionSummary) =>
              setKnowledgeFormData((prev) => ({
                ...prev,
                submissionSummary
              }))
            }
            domain={knowledgeFormData.domain}
            setDomain={(domain) => setKnowledgeFormData((prev) => ({ ...prev, domain }))}
            documentOutline={knowledgeFormData.documentOutline}
            setDocumentOutline={(documentOutline) =>
              setKnowledgeFormData((prev) => ({
                ...prev,
                documentOutline
              }))
            }
          />
        ),
        status: isKnowledgeInfoValid(knowledgeFormData) ? 'default' : 'error'
      },
      {
        id: STEP_IDS[2],
        name: 'File Path Information',
        component: (
          <FilePathInformation
            path={knowledgeFormData.filePath}
            setFilePath={(filePath) => setKnowledgeFormData((prev) => ({ ...prev, filePath }))}
          />
        ),
        status: isFilePathInfoValid(knowledgeFormData) ? 'default' : 'error'
      },
      {
        id: STEP_IDS[3],
        name: 'Document Information',
        component: (
          <DocumentInformation
            isGithubMode={false}
            isEditForm={knowledgeEditFormData?.isEditForm}
            knowledgeDocumentRepositoryUrl={knowledgeFormData.knowledgeDocumentRepositoryUrl}
            setKnowledgeDocumentRepositoryUrl={(knowledgeDocumentRepositoryUrl) =>
              setKnowledgeFormData((prev) => ({ ...prev, knowledgeDocumentRepositoryUrl }))
            }
            knowledgeDocumentCommit={knowledgeFormData.knowledgeDocumentCommit}
            setKnowledgeDocumentCommit={(knowledgeDocumentCommit) =>
              setKnowledgeFormData((prev) => ({
                ...prev,
                knowledgeDocumentCommit
              }))
            }
            documentName={knowledgeFormData.documentName}
            setDocumentName={(documentName) =>
              setKnowledgeFormData((prev) => ({
                ...prev,
                documentName
              }))
            }
          />
        ),
        status: isDocumentInfoValid(knowledgeFormData) ? 'default' : 'error'
      },
      {
        id: STEP_IDS[4],
        name: 'Seed Examples',
        component: (
          <SeedExamples
            isGithubMode={false}
            seedExamples={knowledgeFormData.seedExamples}
            onUpdateSeedExamples={(seedExamples) => setKnowledgeFormData((prev) => ({ ...prev, seedExamples }))}
            addDocumentInfo={addDocumentInfoHandler}
            repositoryUrl={knowledgeFormData.knowledgeDocumentRepositoryUrl}
            commitSha={knowledgeFormData.knowledgeDocumentCommit}
          />
        ),
        status: isSeedExamplesValid(knowledgeFormData) ? 'default' : 'error'
      },
      ...(isGithubMode
        ? [
            {
              id: STEP_IDS[5],
              name: 'Attribution Information',
              component: (
                <AttributionInformation
                  isEditForm={knowledgeEditFormData?.isEditForm}
                  knowledgeFormData={knowledgeFormData}
                  titleWork={knowledgeFormData.titleWork}
                  setTitleWork={(titleWork) => setKnowledgeFormData((prev) => ({ ...prev, titleWork }))}
                  linkWork={knowledgeFormData.linkWork}
                  setLinkWork={(linkWork) => setKnowledgeFormData((prev) => ({ ...prev, linkWork }))}
                  revision={knowledgeFormData.revision}
                  setRevision={(revision) => setKnowledgeFormData((prev) => ({ ...prev, revision }))}
                  licenseWork={knowledgeFormData.licenseWork}
                  setLicenseWork={(licenseWork) => setKnowledgeFormData((prev) => ({ ...prev, licenseWork }))}
                  creators={knowledgeFormData.creators}
                  setCreators={(creators) => setKnowledgeFormData((prev) => ({ ...prev, creators }))}
                />
              )
            }
          ]
        : []),
      {
        id: STEP_IDS[6],
        name: 'Review Submission',
        component: <ReviewSubmission knowledgeFormData={knowledgeFormData} isGithubMode={false} />
      }
    ],
    [addDocumentInfoHandler, isGithubMode, knowledgeEditFormData?.isEditForm, knowledgeFormData]
  );

  useEffect(() => {
    setSubmitEnabled(!steps.find((step) => step.status === 'error'));
  }, [steps]);

  const handleSubmit = async (): Promise<boolean> => {
    if (knowledgeEditFormData) {
      const result = isGithubMode
        ? await updateGithubKnowledgeData(session, knowledgeFormData, knowledgeEditFormData, setActionGroupAlertContent)
        : await updateNativeKnowledgeData(knowledgeFormData, knowledgeEditFormData, setActionGroupAlertContent);
      if (result) {
        router.push('/dashboard');
      }
      return false;
    }
    const result = isGithubMode
      ? await submitGithubKnowledgeData(knowledgeFormData, githubUsername, setActionGroupAlertContent)
      : await submitNativeKnowledgeData(knowledgeFormData, setActionGroupAlertContent);
    if (result) {
      setKnowledgeFormData(DefaultKnowledgeFormData);
    }
    return result;
  };

  return (
    <PageGroup>
      <PageBreadcrumb>
        <Breadcrumb>
          <BreadcrumbItem to="/"> Dashboard </BreadcrumbItem>
          <BreadcrumbItem isActive>Knowledge Contribution</BreadcrumbItem>
        </Breadcrumb>
      </PageBreadcrumb>

      <PageSection className="knowledge-form" isFilled>
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <FlexItem>
                <Title headingLevel="h1" size="2xl" style={{ paddingTop: '10px' }}>
                  Knowledge Contribution
                </Title>
              </FlexItem>
              <FlexItem>
                {devModeEnabled && (
                  <Button variant="secondary" onClick={autoFillForm}>
                    Auto-Fill
                  </Button>
                )}
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Content component="p">
              Knowledge consists of data and facts and is backed by reference documents. When you contribute knowledge, you provide the documents and
              a collection of questions and answers; this new data is used by the model to answer questions more accurately. The contribution form
              guides you through the process, or you can{' '}
              <Button isInline variant="link" onClick={() => setIsYamlModalOpen(true)}>
                upload an existing yaml file.
              </Button>
            </Content>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Wizard
              height={600}
              startIndex={1}
              onClose={handleCancel}
              onStepChange={(_ev, currentStep) => setActiveStepIndex(STEP_IDS.indexOf(String(currentStep.id)))}
              footer={
                <KnowledgeWizardFooter
                  onCancel={handleCancel}
                  knowledgeFormData={knowledgeFormData}
                  isGithubMode={false}
                  onSubmit={handleSubmit}
                  isValid={true}
                  showSubmit={submitEnabled}
                  isEdit={!!knowledgeEditFormData}
                />
              }
            >
              {steps.map((step, index) => (
                <WizardStep key={step.id} id={step.id} name={step.name} status={index < activeStepIndex ? step.status : 'default'}>
                  {step.component}
                </WizardStep>
              ))}
            </Wizard>
          </FlexItem>
        </Flex>

        <YamlFileUploadModal
          isModalOpen={isYamlModalOpen}
          setIsModalOpen={setIsYamlModalOpen}
          isKnowledgeForm={true}
          onYamlUploadKnowledgeFillForm={onYamlUploadKnowledgeFillForm}
          setActionGroupAlertContent={setActionGroupAlertContent}
        />

        <ContributeAlertGroup actionGroupAlertContent={actionGroupAlertContent} onCloseActionGroupAlert={onCloseActionGroupAlert} />
      </PageSection>
    </PageGroup>
  );
};

export default KnowledgeWizard;
