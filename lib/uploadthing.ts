import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAuthenticatedStore } from "@/lib/products";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const store = await getAuthenticatedStore();
      if (!store) throw new UploadThingError("Unauthorized");
      return { storeId: store.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl ?? file.url })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
