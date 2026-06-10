# Media Speed And Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve website speed and reliability by caching static media correctly and using lightweight inline video previews with full-quality playback on interaction.

**Architecture:** Keep assets on Vercel static hosting, because the current problem is cache policy and video payload size rather than backend placement. Add generated silent preview MP4s, wire them through the existing asset registry, and keep full MP4 files for expanded modal playback.

**Tech Stack:** Vite, React, TypeScript, Vitest, Vercel static hosting, FFmpeg.

---

## File Structure

- Modify: `vercel.json` for static asset cache headers.
- Modify: `src/components/LiveVideo.tsx` for `previewSrc` support.
- Modify: `src/components/LiveVideo.test.tsx` for preview/full-source behavior.
- Modify: `src/lib/aixco-live-assets.ts` for preview URL exports.
- Modify: `src/lib/aixco-live-assets.test.ts` for preview URL coverage.
- Modify: `src/components/sections/Hero.tsx` so the hero video wall uses previews.
- Create: `public/aixco-global-op2/media/previews/*.mp4` for section video previews.
- Create: `public/aixco-global-op2/media/batumi-gallery/previews/*.mp4` for gallery and hero previews.

### Task 1: Add Static Asset Cache Headers

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Add cache headers before rewrites**

Set hashed build assets to one year immutable caching and public media to one week browser caching with stale revalidation:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/aixco-global-op2/media/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=604800, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/aixco-global-op2/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=604800, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/aixco-global-op2/documents/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, stale-while-revalidate=604800"
        }
      ]
    },
    {
      "source": "/animations/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=604800, stale-while-revalidate=86400"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

- [ ] **Step 2: Verify JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8')); console.log('ok')"`

Expected: `ok`

### Task 2: Generate Lightweight Preview Videos

**Files:**
- Create: `public/aixco-global-op2/media/previews/bonds-preview.mp4`
- Create: `public/aixco-global-op2/media/previews/batumibuy-preview.mp4`
- Create: `public/aixco-global-op2/media/previews/otium-preview.mp4`
- Create: `public/aixco-global-op2/media/batumi-gallery/previews/batumi1-preview.mp4`
- Create: `public/aixco-global-op2/media/batumi-gallery/previews/batumi2-preview.mp4`
- Create: `public/aixco-global-op2/media/batumi-gallery/previews/batumi3-preview.mp4`
- Create: `public/aixco-global-op2/media/batumi-gallery/previews/batumi4-preview.mp4`
- Create: `public/aixco-global-op2/media/batumi-gallery/previews/batumi5-preview.mp4`
- Create: `public/aixco-global-op2/media/batumi-gallery/previews/herovideo-preview.mp4`

- [ ] **Step 1: Create preview folders**

Run: `New-Item -ItemType Directory -Force -Path public\aixco-global-op2\media\previews,public\aixco-global-op2\media\batumi-gallery\previews | Out-Null`

Expected: folders exist.

- [ ] **Step 2: Generate previews**

Run FFmpeg with 10 seconds, no audio, 24 fps, 720px max width, H.264, and fast-start metadata:

```powershell
$jobs = @(
  @("public\aixco-global-op2\media\bonds-optimized.mp4", "public\aixco-global-op2\media\previews\bonds-preview.mp4"),
  @("public\aixco-global-op2\media\batumibuy-optimized.mp4", "public\aixco-global-op2\media\previews\batumibuy-preview.mp4"),
  @("public\aixco-global-op2\media\otium-optimized.mp4", "public\aixco-global-op2\media\previews\otium-preview.mp4"),
  @("public\aixco-global-op2\media\batumi-gallery\batumi1.mp4", "public\aixco-global-op2\media\batumi-gallery\previews\batumi1-preview.mp4"),
  @("public\aixco-global-op2\media\batumi-gallery\batumi2.mp4", "public\aixco-global-op2\media\batumi-gallery\previews\batumi2-preview.mp4"),
  @("public\aixco-global-op2\media\batumi-gallery\batumi3.mp4", "public\aixco-global-op2\media\batumi-gallery\previews\batumi3-preview.mp4"),
  @("public\aixco-global-op2\media\batumi-gallery\batumi4.mp4", "public\aixco-global-op2\media\batumi-gallery\previews\batumi4-preview.mp4"),
  @("public\aixco-global-op2\media\batumi-gallery\batumi5.mp4", "public\aixco-global-op2\media\batumi-gallery\previews\batumi5-preview.mp4"),
  @("public\aixco-global-op2\media\batumi-gallery\herovideo.mp4", "public\aixco-global-op2\media\batumi-gallery\previews\herovideo-preview.mp4")
)
foreach ($job in $jobs) {
  ffmpeg -y -i $job[0] -t 10 -an -vf "scale='min(720,iw)':-2,fps=24" -c:v libx264 -preset medium -crf 33 -pix_fmt yuv420p -movflags +faststart $job[1]
}
```

Expected: each preview file exists and is much smaller than its source file.

### Task 3: Wire Preview Sources Into React

**Files:**
- Modify: `src/components/LiveVideo.tsx`
- Modify: `src/components/LiveVideo.test.tsx`
- Modify: `src/lib/aixco-live-assets.ts`
- Modify: `src/lib/aixco-live-assets.test.ts`
- Modify: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Add `previewSrc` to `LiveVideo`**

Add `previewSrc?: string` to `LiveVideoProps`. Use `const inlineSrc = previewSrc ?? src;` and set the inline `<video>` `src` to `inlineSrc` while keeping the expanded player `src` as the full `src`.

- [ ] **Step 2: Test full video opens while preview loads inline**

Add a test that renders `<LiveVideo src="/full.mp4" previewSrc="/preview.mp4" title="Preview test" poster="/poster.jpg" eager />`, asserts the inline video has `/preview.mp4`, clicks the tile, and asserts the expanded player has `/full.mp4`.

- [ ] **Step 3: Add preview URL exports**

Create `aixcoLiveVideoPreviews` with preview paths under `/aixco-global-op2/media/previews` and add `previewSrc` to each `aixcoBatumiGalleryVideos` item.

- [ ] **Step 4: Use previews in sections**

Pass `previewSrc` to `LiveVideo` in Participate and Batumi. In Hero, use `video.previewSrc ?? video.src` for the background video source.

### Task 4: Verify Locally

**Files:**
- Test: `src/components/LiveVideo.test.tsx`
- Test: `src/lib/aixco-live-assets.test.ts`

- [ ] **Step 1: Run focused tests**

Run: `npm test -- src/components/LiveVideo.test.tsx src/lib/aixco-live-assets.test.ts src/components/sections/Hero.test.tsx`

Expected: all focused tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: Vite build completes successfully.

- [ ] **Step 3: Inspect built media sizes**

Run: `Get-ChildItem -Path dist\aixco-global-op2\media -Recurse -File | Sort-Object Length -Descending | Select-Object -First 20 @{Name='MB';Expression={[math]::Round($_.Length/1MB,2)}}, FullName | Format-Table -AutoSize`

Expected: preview videos are present and smaller than full MP4 files.

### Task 5: Verify Production After Push

**Files:**
- No code changes.

- [ ] **Step 1: Push to GitHub**

Run: `git push origin main`

Expected: Vercel creates a Git deployment from the push.

- [ ] **Step 2: Verify cache headers**

Run: `curl.exe -I https://aixco-global-website.vercel.app/aixco-global-op2/media/batumi-gallery/previews/batumi2-preview.mp4`

Expected: `200 OK` and `Cache-Control: public, max-age=604800, stale-while-revalidate=86400`.

- [ ] **Step 3: Verify site media loads**

Open `https://aixco-global-website.vercel.app/` and check the hero, Batumi, Participate, and video gallery sections for missing images, missing posters, console errors, or failed media requests.
