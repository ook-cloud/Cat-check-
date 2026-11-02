# Cat Classifier Lab

A web app that learns to tell cats from other things. You teach it in the **Training ground** (upload, label, train, save) and check it in the **Testing ground** (load the saved model, guess on photos it never saw).

Built with Next.js, Supabase Storage, Prisma and TensorFlow.js.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Create a public bucket.** Go to Storage > New bucket, name it `cat-lab`, and turn on **Public bucket**.
3. **Add your keys.** Copy the example file, then fill in the values it describes:
   ```bash
   cp .env.example .env
   ```
4. **Create the database tables:**
   ```bash
   npm install
   npm run db:push
   ```
5. **Start the app** and open <http://localhost:3000>:
   ```bash
   npm run dev
   ```

## How the model works

- **It learns on top of a pretrained base.** Starting from nothing would need thousands of photos. So training downloads MobileNet, a small network that already recognizes shapes and textures, and trains only 2 new layers on your photos. Your browser needs internet access for this.
- **Test photos stay out of training.** When training starts, about 20% of each label is held back. At least 1 photo of each label always stays in training, so you need 3 or more photos of a label for one to be held back.
- **Changes make the model out of date.** Adding a photo or changing a label means you have to train again before testing.

## Where the code is

| Folder | What it holds |
| --- | --- |
| `app/_components` | The 16 small components from the build guide (C1 to C16) |
| `app/_features` | The screens and what the user can do on them (F1 to F5) |
| `app/api` | Server routes for photos and the saved model |
| `lib` | Model training, API calls and server helpers |
| `prisma` | The database tables |

## Before you put it online

This app has no login, so anyone who can open it can add photos, change labels and replace the model. Everything in the bucket is public. Keep it on your own computer, or add login first.
