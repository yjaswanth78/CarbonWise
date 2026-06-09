# Google Cloud Platform (GCP) Setup Guide for CarbonWise

This guide will walk you through setting up the required Google Cloud resources step-by-step. By the end of this guide, you will collect two things needed for our code:
1. **GCP Project ID**
2. **Service Account Key File (`credentials.json`)**

---

### Step 1: Create a Google Cloud Account and Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account. (If you don't have a billing account, GCP offers a free tier/credits for new users. You will need to attach a card, but we will keep our usage well within the **free tier** limits so you won't be charged).
3. At the top of the page, click the project dropdown (it might say "Select a project" or show a default project name).
4. Click **New Project** in the top-right of the dropdown window.
5. Enter a project name, for example: `CarbonWise`.
6. Click **Create**.
7. Wait a few seconds for the project to be created, then select it from the project dropdown at the top.
8. **Collect this:** Note down your **Project ID** (e.g., `carbonwise-123456`). You can find it on the dashboard or in the project dropdown.

---

### Step 2: Enable the Required APIs
We need Google Cloud Vision (for receipt scanning) and Cloud Storage (for photo uploads).
1. In the search bar at the top of the GCP Console, search for **Cloud Vision API**.
2. Click on the result under "Marketplace & APIs".
3. Click the blue **Enable** button.
4. Go back to the search bar and search for **Cloud Storage API** (or **Google Cloud Storage JSON API**).
5. Ensure it is enabled (it is usually enabled by default).

---

### Step 3: Create a Google Cloud Storage (GCS) Bucket
This is where the user's uploaded receipt photos will be stored.
1. In the search bar at the top, type **Storage** and select **Cloud Storage** -> **Buckets**.
2. Click **Create** at the top.
3. **Name your bucket**: The name must be globally unique across all of Google Cloud (e.g., `carbonwise-receipts-[your-initials]`). Note down this bucket name!
4. **Location type**: Select **Region** and choose a location closest to you (e.g., `asia-south1` for India, or `us-central1` for the US).
5. **Storage class**: Select **Standard**.
6. **Access control**: Uncheck "Enforce public access prevention on this bucket" if you want receipt images to be viewable in your frontend app via their public URLs. Alternatively, select **Uniform** or **Fine-grained** (we will use Fine-grained access control to make uploaded photos public).
7. Click **Create** at the bottom.

---

### Step 4: Create a Service Account and JSON Key
To allow our Python backend (running on your computer) to securely talk to Google Cloud, we need credentials.
1. In the search bar, search for **IAM & Admin** and select **Service Accounts**.
2. Click **+ Create Service Account** at the top.
3. Enter a name (e.g., `carbonwise-backend`) and click **Create and Continue**.
4. **Grant access (Roles)**: Under "Select a role", choose:
   - **Storage Object Admin** (allows uploading and managing files in GCS).
   - **Cloud Vision API User** (allows scanning images using Vision API).
5. Click **Continue**, then click **Done**.
6. In the list of Service Accounts, click on the email address of the service account you just created.
7. Go to the **Keys** tab at the top.
8. Click **Add Key** -> **Create new key**.
9. Select **JSON** as the key type and click **Create**.
10. A JSON file will automatically download to your computer.
    - **Move this file** into the folder `c:\Users\yjasw\Downloads\Hack2skill promptwars2\backend\` and rename it to `credentials.json`.
    - **IMPORTANT**: Keep this file private. Never commit it to GitHub.

---

### What to provide next:
Once you have completed these steps, write a message in the chat containing:
1. Your **GCP Project ID**.
2. Your **GCS Bucket Name**.
3. Confirmation that you have downloaded the service account JSON key file.
