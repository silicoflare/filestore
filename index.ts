import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteBucketPolicyCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command, PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrlPresigner } from "@aws-sdk/s3-request-presigner";

export type FileStorageConfig = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export class FileStorage {
  private s3: S3Client;

  public constructor(config: FileStorageConfig) {
    this.s3 = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  public async createBucket(bucket: string) {
    return await this.s3.send(
      new CreateBucketCommand({
        Bucket: bucket,
      })
    );
  }

  public async deleteBucket(bucket: string) {
    return await this.s3.send(
      new DeleteBucketCommand({
        Bucket: bucket,
      })
    );
  }

  public async listBuckets() {
    return await this.s3.send(new ListBucketsCommand({}));
  }

  public async listFiles(bucket: string) {
    return await this.s3.send(new ListObjectsV2Command({
      Bucket: bucket,
    }));
  }

  public async getFileMetadata(bucket: string, key: string) {
    return await this.s3.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    }));
  }

  public async setBucketPublic(bucket: string) {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };

    return await this.s3.send(
      new PutBucketPolicyCommand({
        Bucket: bucket,
        Policy: JSON.stringify(policy),
      })
    );
  }

  public async setBucketPrivate(bucket: string) {
    return await this.s3.send(
      new DeleteBucketPolicyCommand({
        Bucket: bucket,
      })
    );
  }

  public async uploadFile(
    bucket: string,
    key: string,
    contentType: string,
    file: Buffer
  ) {
    return await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );
  }

  public async getFile(bucket: string, key: string) {
    const res = await this.s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    if (!res.Body) {
      throw new Error("Body not received.");
    }
    const buf = await res.Body.transformToByteArray();
    return buf;
  }

  public async getSignedUrl(
    bucket: string,
    key: string,
    expiresIn: number = 3600
  ) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrlPresigner(this.s3, command, { expiresIn });
    return signedUrl;
  }

  public async getPublicUrl(bucket: string, key: string) {
    return `${this.s3.config.endpoint}/${bucket}/${key}`;
  }

  public async deleteFile(bucket: string, key: string) {
    return await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }
}