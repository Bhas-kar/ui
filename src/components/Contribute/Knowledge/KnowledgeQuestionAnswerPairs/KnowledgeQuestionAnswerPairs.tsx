import React, { useEffect, useState } from 'react';
import { KnowledgeSeedExample, QuestionAndAnswerPair } from '@/types';
import { FormGroup, TextArea, ValidatedOptions, FormHelperText, HelperText, HelperTextItem, FormFieldGroupHeader } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

interface Props {
  seedExample: KnowledgeSeedExample;
  seedExampleIndex: number;
  handleContextInputChange: (seedExampleIndex: number, contextValue: string) => void;
  handleContextBlur: (seedExampleIndex: number) => void;
  handleQuestionInputChange: (seedExampleIndex: number, questionAndAnswerIndex: number, questionValue: string) => void;
  handleQuestionBlur: (seedExampleIndex: number, questionAndAnswerIndex: number) => void;
  handleAnswerInputChange: (seedExampleIndex: number, questionAndAnswerIndex: number, answerValue: string) => void;
  handleAnswerBlur: (seedExampleIndex: number, questionAndAnswerIndex: number) => void;
}

const KnowledgeQuestionAnswerPairs: React.FC<Props> = ({
  seedExample,
  seedExampleIndex,
  handleContextInputChange,
  handleContextBlur,
  handleQuestionInputChange,
  handleQuestionBlur,
  handleAnswerInputChange,
  handleAnswerBlur
}) => {
  const [contextWordCount, setContextWordCount] = useState(0);
  const MAX_WORDS = 500;

  // TODO: replace with a tokenizer library
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Update word count whenever context changes
  useEffect(() => {
    setContextWordCount(countWords(seedExample.context));
  }, [seedExample.context]);

  // Handle context input change with word count validation
  const onContextChange = (_event: React.FormEvent<HTMLTextAreaElement>, contextValue: string) => {
    const wordCount = countWords(contextValue);
    if (wordCount <= MAX_WORDS) {
      handleContextInputChange(seedExampleIndex, contextValue);
    } else {
      // allow the overage and show validation error
      handleContextInputChange(seedExampleIndex, contextValue);
    }
  };

  return (
    <FormGroup key={seedExampleIndex}>
      <TextArea
        key={seedExampleIndex * 10 + 1}
        isRequired
        type="text"
        aria-label={`Context ${seedExampleIndex + 1}`}
        placeholder="Enter the context from which the Q&A pairs are derived. (500 words max)"
        value={seedExample.context}
        validated={seedExample.isContextValid}
        onChange={onContextChange}
        onBlur={() => handleContextBlur(seedExampleIndex)}
      />

      {/* Display word count */}
      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            {contextWordCount} / {MAX_WORDS} words
          </HelperTextItem>
        </HelperText>
      </FormHelperText>

      {seedExample.isContextValid === ValidatedOptions.error && (
        <FormHelperText key={seedExampleIndex * 10 + 2}>
          <HelperText>
            <HelperTextItem icon={<ExclamationCircleIcon />} variant={seedExample.isContextValid}>
              {seedExample.validationError || 'Required field. It must be non-empty and less than 500 words.'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}

      {seedExample.questionAndAnswers.map((questionAndAnswerPair: QuestionAndAnswerPair, questionAnswerIndex) => (
        <div key={seedExampleIndex * 100 + questionAnswerIndex * 10 + 0}>
          <FormFieldGroupHeader
            titleText={{
              text: (
                <p>
                  Q&A Pair {questionAnswerIndex + 1} {questionAndAnswerPair.immutable && <span style={{ color: 'red' }}>*</span>}
                </p>
              ),
              id: 'nested-field-group1-titleText-id'
            }}
          />
          <React.Fragment key={questionAnswerIndex}>
            <TextArea
              key={seedExampleIndex * 100 + questionAnswerIndex * 10 + 1}
              isRequired
              type="text"
              aria-label={`Question ${seedExampleIndex + 1}-${questionAnswerIndex + 1}`}
              placeholder={`Enter question ${questionAnswerIndex + 1}`}
              value={questionAndAnswerPair.question}
              maxLength={250}
              validated={questionAndAnswerPair.isQuestionValid}
              onChange={(_event, questionValue) => handleQuestionInputChange(seedExampleIndex, questionAnswerIndex, questionValue)}
              onBlur={() => handleQuestionBlur(seedExampleIndex, questionAnswerIndex)}
            />
            {seedExample.questionAndAnswers[questionAnswerIndex].isQuestionValid === ValidatedOptions.error && (
              <FormHelperText key={seedExampleIndex * 100 + questionAnswerIndex * 10 + 2}>
                <HelperText>
                  <HelperTextItem icon={<ExclamationCircleIcon />} variant={seedExample.questionAndAnswers[questionAnswerIndex].isQuestionValid}>
                    {seedExample.questionAndAnswers[questionAnswerIndex].questionValidationError ||
                      'Required field. Total length of all Q&A pairs should be less than 250 words.'}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
            <TextArea
              key={seedExampleIndex * 100 + questionAnswerIndex * 10 + 3}
              isRequired
              type="text"
              aria-label={`Answer ${seedExampleIndex + 1}-${questionAnswerIndex + 1}`}
              placeholder={`Enter answer ${questionAnswerIndex + 1}`}
              value={questionAndAnswerPair.answer}
              maxLength={250}
              validated={questionAndAnswerPair.isAnswerValid}
              onChange={(_event, answerValue) => handleAnswerInputChange(seedExampleIndex, questionAnswerIndex, answerValue)}
              onBlur={() => handleAnswerBlur(seedExampleIndex, questionAnswerIndex)}
            />
            {seedExample.questionAndAnswers[questionAnswerIndex].isAnswerValid === ValidatedOptions.error && (
              <FormHelperText key={seedExampleIndex * 100 + questionAnswerIndex * 10 + 4}>
                <HelperText>
                  <HelperTextItem icon={<ExclamationCircleIcon />} variant={seedExample.questionAndAnswers[questionAnswerIndex].isAnswerValid}>
                    {seedExample.questionAndAnswers[questionAnswerIndex].answerValidationError ||
                      'Required field. Total length of all Q&A pairs should be less than 250 words.'}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </React.Fragment>
        </div>
      ))}
    </FormGroup>
  );
};

export default KnowledgeQuestionAnswerPairs;
