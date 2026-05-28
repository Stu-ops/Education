import os
import boto3
from botocore.client import Config
from datetime import datetime
from typing import Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class R2Service:
    """Storage service supporting Backblaze B2 (S3-compatible).

    Configuration via environment variables. Set `STORAGE_PROVIDER` to
    'backblaze'.
    """

    def __init__(self):
        # allow a custom CDN domain used for public URLs
        self.custom_domain = os.getenv("STORAGE_CUSTOM_DOMAIN")
 
        # Backblaze S3-compatible settings
        self.access_key_id = os.getenv("BACKBLAZE_B2_ACCESS_KEY_ID")
        self.secret_access_key = os.getenv("BACKBLAZE_B2_SECRET_ACCESS_KEY")
        self.bucket_name = os.getenv("BACKBLAZE_B2_BUCKET_NAME")
        self.endpoint = os.getenv("BACKBLAZE_B2_ENDPOINT")
        self.region = os.getenv("BACKBLAZE_B2_REGION")

        if not all([self.access_key_id, self.secret_access_key, self.bucket_name, self.endpoint]):
            logger.error("Missing Backblaze B2 configuration")
            raise ValueError("Backblaze B2 credentials not configured")

        # Use s3v4 signature for Backblaze
        config = Config(signature_version="s3v4", retries={"max_attempts": 3, "mode": "adaptive"})
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            region_name=self.region or None,
            config=config,
        )
        logger.info(f"Backblaze B2 (S3) Storage initialized for bucket: {self.bucket_name}")

    def generate_presigned_upload_url(self, object_key: str, expires_in: int = 3600, content_type: str = "video/mp4") -> str:
        """Generate a presigned PUT URL for uploading an object.

        Returns the presigned URL as a string.
        """
        try:
            # Limit expiration to 24 hours for safety
            expiration = min(expires_in, 24 * 3600)
            presigned_url = self.s3_client.generate_presigned_url(
                ClientMethod="put_object",
                Params={"Bucket": self.bucket_name, "Key": object_key, "ContentType": content_type},
                ExpiresIn=expiration,
            )
            logger.info(f"Generated presigned upload URL for: {object_key}")
            return presigned_url
        except Exception as e:
            logger.error(f"Error generating presigned upload URL: {e}")
            raise

    def generate_presigned_download_url(self, object_key: str, expires_in: int = 3600) -> str:
        """Generate a presigned GET URL for downloading an object."""
        try:
            expiration = min(expires_in, 24 * 3600)
            presigned_url = self.s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": self.bucket_name, "Key": object_key},
                ExpiresIn=expiration,
            )
            logger.info(f"Generated presigned download URL for: {object_key}")
            return presigned_url
        except Exception as e:
            logger.error(f"Error generating presigned download URL: {e}")
            raise

    def download_object_to_file(self, object_key: str, destination_path: Path) -> Path:
        """Download an object from storage to a local path for backend processing."""
        try:
            destination_path.parent.mkdir(parents=True, exist_ok=True)
            self.s3_client.download_file(self.bucket_name, object_key, str(destination_path))
            logger.info(f"Downloaded object for processing: {object_key}")
            return destination_path
        except Exception as e:
            logger.error(f"Error downloading object {object_key}: {e}")
            raise

    def get_cdn_url(self, object_key: str) -> str:
        """Return a public CDN URL for a given object key.

        If a custom CDN domain is configured (`STORAGE_CUSTOM_DOMAIN`), use it.
        Otherwise, build a provider-specific URL (Backblaze path-style).
        """
        if self.custom_domain:
            return f"https://{self.custom_domain}/file/{self.bucket_name}/{object_key}"
        else:
            # Backblaze S3-style public URL: https://{endpoint}/{bucket}/{object_key}
            return f"{self.endpoint.rstrip('/')}/{self.bucket_name}/{object_key}"

    def delete_object(self, object_key: str) -> None:
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_key)
            logger.info(f"Deleted object: {object_key}")
        except Exception as e:
            logger.error(f"Error deleting object: {e}")
            raise


_storage_service = None

def get_r2_service() -> R2Service:
    global _storage_service
    if _storage_service is None:
        _storage_service = R2Service()
    return _storage_service
