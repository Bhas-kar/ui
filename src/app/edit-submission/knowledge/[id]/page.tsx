// src/app/edit-submission/knowledge/[id]/page.tsx
import * as React from 'react';
import { AppLayout } from '@/components/AppLayout';
import EditKnowledge from '@/components/Contribute/Github/EditKnowledge/EditKnowledge';

type PageProps = {
  params: Promise<{ id: string }>;
};

const EditKnowledgePage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const prNumber = parseInt(resolvedParams.id, 10);

  return (
    <AppLayout>
      <EditKnowledge prNumber={prNumber} />
    </AppLayout>
  );
};

export default EditKnowledgePage;
