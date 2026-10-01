import fs from 'fs/promises';
import path from 'path';
import { TaskHandler, TaskExecutionContext, TaskHandlerResult, Artifact } from '../types.js';

export const fileGeneratorHandler: TaskHandler = async (ctx: TaskExecutionContext): Promise<TaskHandlerResult> => {
  const { 
    output_filename = `artifact_${Date.now()}.txt`, 
    output_content = 'Generated report content from Agentic Company Worker.',
    file_kind = 'report',
    artifact_label = 'Generated Artifact',
    cwd
  } = ctx.task.payload;

  ctx.log('info', `Starting artifact generation: ${output_filename} (kind: ${file_kind})`);

  try {
    const baseDir = cwd || path.join(process.cwd(), 'scratch');
    await fs.mkdir(baseDir, { recursive: true });

    const targetPath = path.join(baseDir, output_filename);
    await fs.writeFile(targetPath, output_content, 'utf-8');

    const stats = await fs.stat(targetPath);
    ctx.log('success', `File successfully written to ${targetPath} (${stats.size} bytes).`);

    const artifact: Omit<Artifact, 'run_id'> = {
      kind: file_kind as Artifact['kind'],
      url_or_path: targetPath,
      label: artifact_label,
      metadata: {
        filename: output_filename,
        sizeBytes: stats.size,
        generatedAt: new Date().toISOString(),
        taskId: ctx.task.id,
        workerId: ctx.workerId
      }
    };

    return {
      exitCode: 0,
      summary: `Successfully generated ${output_filename} (${stats.size} bytes).`,
      artifacts: [artifact],
      result: {
        path: targetPath,
        sizeBytes: stats.size,
        kind: file_kind
      }
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.log('error', `Failed to generate file artifact: ${message}`);
    return {
      exitCode: 1,
      summary: `Artifact generation failed: ${message}`,
      result: { error: message }
    };
  }
};
