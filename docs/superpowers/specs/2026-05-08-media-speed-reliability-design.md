# Media Speed And Reliability Design

## Goal

Improve perceived speed and media reliability on the AIXCO.Global website without moving assets to a database or making the live site dependent on a new media backend.

## Research Summary

Vercel already serves static files through its CDN, but the live media responses currently use `Cache-Control: public, max-age=0, must-revalidate`, so repeat visitors revalidate images and videos instead of using a warm browser cache. Vercel documentation supports configuring route headers in `vercel.json`, while web.dev recommends poster-first video loading and avoiding unnecessary video downloads. Supabase Storage is useful for future media management, but moving the same files there would not by itself make the current site faster.

## Architecture

Keep the existing Vercel-hosted static asset model. Add long-lived cache headers for build assets and practical browser cache headers for public media. For videos, use a poster-first flow with lightweight inline preview MP4s and keep the original/full optimized MP4s for the expanded player.

## Components

- `vercel.json`: defines cache headers for `/assets`, `/aixco-global-op2/media`, `/aixco-global-op2/images`, `/aixco-global-op2/documents`, and shared static assets.
- `public/aixco-global-op2/media/**/previews`: stores small silent preview MP4s generated from existing site videos.
- `src/lib/aixco-live-assets.ts`: exposes preview video URLs next to the full video URLs.
- `src/components/LiveVideo.tsx`: loads preview media for inline cards and the full video only when the user opens the modal.
- `src/components/sections/Hero.tsx`: uses preview videos for the hero video wall.

## Data Flow

Initial render shows WebP posters immediately. When a video tile is near the viewport, the inline `<video>` loads the preview MP4 only. If playback fails or no frame is available, the poster remains visible. When a user clicks a video tile, the modal opens the full `src` MP4 with controls.

## Error Handling

Poster images stay visible until a video frame is rendered. Video play failures are caught so browser autoplay policies do not surface console errors. The expanded player keeps controls enabled so users can manually start playback if autoplay is blocked.

## Testing

Unit tests should cover preview-vs-full video source behavior and asset URL mapping. Build verification should confirm Vite output succeeds. Production verification should confirm cache headers are applied and key image/video routes return `200 OK`.

## Out Of Scope

This change does not move media to Supabase Storage, add an admin panel, or replace MP4 playback with HLS/adaptive streaming. Those are larger content-management or video-platform decisions and are not required for the immediate speed/reliability goal.
