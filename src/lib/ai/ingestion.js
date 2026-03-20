import ResourceChunk from "@/models/ResourceChunk";

export async function ingestResource(resource) {
  if (!resource.textContent || resource.status !== "approved") {
    // If resource is not approved, we should probably remove its existing chunks
    await ResourceChunk.deleteMany({ resourceId: resource._id });
    return;
  }

  const textContent = resource.textContent;
  const chunkSize = 1500;
  const overlap = 200;
  const chunks = [];

  for (let i = 0; i < textContent.length; i += chunkSize - overlap) {
    const chunk = textContent.slice(i, i + chunkSize);
    chunks.push(chunk);
    if (i + chunkSize >= textContent.length) break;
  }

  // Clear existing chunks for this resource
  await ResourceChunk.deleteMany({ resourceId: resource._id });

  if (chunks.length > 0) {
    const chunkDocs = chunks.map((text) => ({
      resourceId: resource._id,
      moduleId: resource.module,
      chunkText: text,
      metadata: {
        section: resource.title,
      },
    }));

    await ResourceChunk.insertMany(chunkDocs);
  }
}

export async function deleteResourceChunks(resourceId) {
  await ResourceChunk.deleteMany({ resourceId });
}
