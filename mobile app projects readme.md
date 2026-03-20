# BrainSpark

> Flashcard & quiz learning app that turns any subject into a smart, adaptive study system.

---

## Overview

BrainSpark is a mobile learning app that helps users study smarter using spaced-repetition flashcards and timed quiz sessions. Users organize cards into decks by topic, track mastery progress, and review performance analytics — making it effective for students, professionals, and lifelong learners.

---

## Problem

Traditional study methods — re-reading notes and passive review — are inefficient and hard to measure. Learners struggle to identify which topics need more attention and often study material they already know, wasting time before exams or certifications.

---

## Solution

BrainSpark combines active recall with performance tracking. Cards are flagged by difficulty, mastery is computed from accuracy scores, and study sessions surface weak cards more frequently. Users see exactly where they stand after every session and get reminded when it's time to review.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart) |
| Auth | Supabase Auth (email + Google OAuth) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (card images) |
| Backend Logic | Supabase Edge Functions (Deno) |
| Real-time Sync | Supabase Realtime |
| Notifications | flutter_local_notifications |
| Charts | fl_chart |
| Typography | Google Fonts |
| Animations | flutter_staggered_animations |

---

## Features

**Core**
- Deck creation with custom color, emoji, name, and description
- Flashcard editor with front, back, hint, and per-card difficulty rating (Easy / Medium / Hard)
- Flip-card study session with swipe gestures and self-rating
- Timed multiple-choice quiz mode generated from deck content
- Mastery algorithm: cards marked mastered at ≥ 80% accuracy over 3+ reviews
- Adaptive review frequency — harder cards resurface more often

**Backend & Infrastructure**
- Supabase Auth with persistent sessions and token refresh
- Decks and cards stored in Supabase PostgreSQL, scoped per user via Row Level Security (RLS)
- Real-time deck sync across devices via Supabase Realtime subscriptions
- Card images uploaded to Supabase Storage with CDN delivery
- Supabase Edge Function calculates spaced-repetition review intervals server-side
- Offline study mode — local cache for uninterrupted sessions, changes synced on reconnect
- Supabase cron job sends daily review-due counts to the notification service

**Analytics & Progress**
- Per-deck accuracy trends, review history, and mastery percentage
- Weekly study time and quiz score charts via fl_chart
- Daily study goal tracking with streak counter
- Local push notifications for study reminders at user-configured times

**UX**
- Dark / light theme toggle
- Drag-to-reorder cards within decks
- Settings: daily goal, notification schedule, preferred quiz difficulty

---

## Challenges

- Implementing a server-side spaced-repetition scheduler that stays accurate across time zones
- Syncing card completion state in real time without conflicts when studying on two devices simultaneously
- Keeping quiz question generation varied across repeated sessions on the same small deck

---

## Screenshots

_Dashboard · Study Session · Quiz Mode · Progress_

---

---

---

# Circlo

> A social feed app for niche communities to connect and bond through shared content.

---

## Overview

Circlo is a community-first mobile social platform where users join interest-based circles, share posts with media, interact with content through reactions and comments, and discover new communities matching their interests. It focuses on smaller, tighter groups rather than mass broadcasting.

---

## Problem

Mainstream social media platforms are noisy, algorithm-driven, and optimized for engagement over genuine connection. Users seeking community around niche interests — photography, local events, hobbies — struggle to find signal in broadly targeted platforms.

---

## Solution

Circlo organizes users into named circles (topic communities). Feeds are scoped to the circles a user joins, reactions are minimal and intentional, and discovery surfaces circles rather than individual viral content — keeping the focus on community.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.74 (TypeScript) |
| State Management | Zustand |
| Navigation | React Navigation v6 |
| Auth | Firebase Authentication (email + Google) |
| Database | Firebase Firestore |
| Storage | Firebase Cloud Storage |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Image Handling | react-native-fast-image |
| Media Picker | expo-image-picker |
| Styling | StyleSheet + Reanimated 3 |

---

## Features

**Core**
- Create, join, and leave interest-based circles
- Post text, single images, or multi-image galleries inside a circle
- Reaction bar (6 icons) with live animated counter
- Threaded comments with nested replies
- User profiles with avatar, bio, joined circles, and post history
- Discovery feed showing trending and recently active circles

**Backend & Infrastructure**
- Firebase Auth — persistent sessions, email verification, Google OAuth
- Firestore collections: `/circles`, `/posts`, `/comments`, `/users` — all scoped with security rules
- Firestore real-time listeners on home feed and circle feeds for live post updates without polling
- Firebase Cloud Storage for images with upload progress indicator and thumbnail compression before upload
- FCM push notifications: new comment on your post, circle activity digest, new follower
- Firestore offline persistence enabled for full offline read and in-queue write support
- Security rules enforce: only circle members can write posts; only post authors can delete
- Background FCM token refresh handled transparently

**Social & UX**
- Follow other users and see a personalized activity feed
- Notification center: grouped by circle and type with mark-all-read
- Image lightbox with pinch-to-zoom and swipe-to-dismiss
- Optimistic UI updates for reactions and follows
- Pull-to-refresh on all feeds
- Dark and light theme via system preference

**Offline & Performance**
- Firestore offline cache for viewing previously loaded posts without connectivity
- In-queue writes — posting while offline resolves automatically on reconnect
- Lazy-loaded feed with pagination (cursor-based via Firestore `startAfter`)

---

## Challenges

- Structuring Firestore security rules to allow circle membership checks without multi-document reads on every request
- Managing real-time listener cleanup to prevent memory leaks when navigating between circle feeds
- Handling concurrent reactions efficiently without Firestore write conflicts

---

## Screenshots

_Home Feed · Circle View · Post Detail · Profile_

---

---

---

# Eventora

> A full-featured event discovery and ticketing app for managing events in real time.

---

## Overview

Eventora is a Flutter app for discovering, creating, and attending events — from local meetups to organized conferences. Users browse events by category and location, purchase or RSVP for tickets, and receive real-time updates from event organizers.

---

## Problem

Event discovery is fragmented across platforms that mix local and global events without useful filtering. Creating an event still requires a website or desktop tool, and ticket management — confirmations, cancellations, guest lists — lacks a mobile-native workflow.

---

## Solution

Eventora centralizes event creation and attendance in one mobile experience. Organizers manage events, track RSVPs, and push announcements directly in-app. Attendees browse by category and location, RSVP or purchase tickets, and get real-time push updates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart) |
| Auth | Appwrite Auth (email + Google OAuth) |
| Database | Appwrite Database (collections) |
| Storage | Appwrite Storage (event banners, assets) |
| Backend Logic | Appwrite Functions (Node.js runtime) |
| Real-time | Appwrite Realtime (WebSocket subscriptions) |
| Push Notifications | Appwrite Messaging + flutter_local_notifications |
| Maps | google_maps_flutter |
| Payments | mockable payment intent hook (placeholder) |
| State | flutter_bloc |

---

## Features

**Core**
- Browse events by category (Music, Sports, Tech, Food, Arts, Community)
- Search by keyword, date range, and radius from current location
- Event detail page with banner, description, organizer info, and ticket tiers
- RSVP (free) and ticket purchase flow with quantity selector
- QR ticket generation per attendee stored locally and in Appwrite
- Organizer panel: create/edit/cancel events, view guest list, adjust capacity

**Backend & Infrastructure**
- Appwrite Auth with email/password and OAuth2, session tokens refreshed automatically
- Appwrite Database collections: `events`, `users`, `tickets`, `categories` with document-level permission rules
- Appwrite Realtime subscriptions on `events` collection — attendee count updates live without polling
- Appwrite Storage with CDN for event banner images; upload flow validates file type and size at function level
- Appwrite Function runs on POST `/book-ticket`: validates capacity, creates ticket document, and triggers confirmation message
- Appwrite Messaging sends booking confirmation and organizer announcements via push and email
- Appwrite Function cancellation hook: on event cancellation, marks all tickets void and sends refund notification
- Row-level document permissions: only event creator can update/delete event documents

**Discovery & UX**
- Map view showing event pins in a 25km radius with tap-to-preview cards
- Calendar date picker to filter events by day
- Saved/bookmarked events list with offline cached data
- Animated hero transitions between event list and detail
- Countdown timer on event cards within 48 hours of start

**Attendee Flow**
- Ticket wallet: all upcoming tickets with QR code
- Scan mode for organizers to validate QR check-in
- Post-event prompt for review/rating
- Push notification 1 hour before event start

---

## Challenges

- Preventing ticket overbooking under concurrent purchase requests without a dedicated queuing system
- Ensuring Appwrite Realtime WebSocket connections reconnect seamlessly after network interruption
- Generating scannable QR codes locally and syncing validation state with the Appwrite backend

---

## Screenshots

_Discover · Event Detail · Ticket Wallet · Organizer Panel_

---

---

---

# FitTrail

> Native Android fitness tracker built with Jetpack Compose for serious workout logging.

---

## Overview

FitTrail is a native Android app that helps users log workouts, track exercise progress over time, and stay consistent with their fitness goals. It supports custom exercise libraries, set/rep/weight logging, rest timers, and visual progression charts — all on-device with cloud backup.

---

## Problem

Many fitness apps are packed with social features and upsells that get in the way of simply logging a workout. Serious gym-goers want a fast, reliable, and private workout journal with solid charting and offline-first operations.

---

## Solution

FitTrail is intentionally minimal: log exercises, track your numbers, see progress. No social feed, no paywalled basics. Data lives locally in Room and optionally syncs to Firebase for backup and multi-device access.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Architecture | MVVM + Clean Architecture |
| DI | Hilt |
| Local DB | Room (SQLite) |
| Network | Retrofit 2 + OkHttp |
| Auth | Firebase Authentication (email + Google) |
| Cloud Backup | Firebase Firestore |
| Health Data | Health Connect API |
| Charts | Vico (Compose charts library) |
| Async | Kotlin Coroutines + Flow |
| Navigation | Compose Navigation |

---

## Features

**Core**
- Custom exercise library: add exercises with name, muscle group, equipment type, and optional notes
- Workout session builder: add exercises, log sets with reps and weight (or time for cardio)
- In-session rest timer with vibration alert
- Workout history with full drill-down per session
- Volume/1RM progression charts per exercise via Vico
- Body weight log and progression graph

**Backend & Infrastructure**
- Firebase Auth with email/password and Google OAuth; per-user data namespaced server-side
- Local Room database as the primary store: `workouts`, `exercises`, `sets`, `body_log` tables with full relational model
- Firebase Firestore cloud backup: user taps "Backup Now" and all Room data serializes and upserts to Firestore
- Cloud restore flow on new device install — pulls Firestore snapshot into local Room on first login
- Retrofit client for future API nutrition data integration (endpoint-ready, currently mocked)
- Health Connect integration: reads step count and active calories; writes completed workout duration

**Session UX**
- Drag-to-reorder exercises mid-session
- Superset grouping — mark two exercises as a pair
- Previous session numbers shown greyed beneath each set input for reference
- Session timer running in the status bar via a foreground Service

**Offline & Data**
- Full offline-first architecture: Room is the source of truth at all times
- Workouts logged without connectivity are backed up on next cloud sync
- Hilt provides scoped ViewModel dependencies for clean unit testing
- All database operations run on Dispatchers.IO via Coroutines

---

## Challenges

- Keeping the in-session rest timer alive accurately when the app is backgrounded without excessive battery drain
- Designing the Room schema to support both free-weight and bodyweight and cardio exercises in one unified model
- Reconciling conflicts when Firestore backup contains a newer session than local Room on a restored device

---

## Screenshots

_Dashboard · Active Session · Exercise History · Charts_

---

---

---

# HabitForge

> A habit tracking app that builds the systems to make good habits stick for good.

---

## Overview

HabitForge helps users design, track, and sustain daily habits across any life area — health, mindfulness, productivity, or learning. Habits are grouped into routines, tracked with a streak system, and visualized with heatmaps and completion trends to keep users accountable.

---

## Problem

Many people start habits but give up within weeks because motivation fades and there is no feedback loop rewarding consistency. Existing apps focus on simple checkboxes without surfacing patterns or helping users understand what's working.

---

## Solution

HabitForge makes streaks and patterns visible through heatmaps and weekly analytics. Users build routines from groups of habits, get smart reminders, and receive streak-protection nudges before they miss a day. The system rewards consistency rather than perfection.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart) |
| Auth | Supabase Auth (email + Apple OAuth) |
| Database | Supabase PostgreSQL |
| Real-time | Supabase Realtime |
| Edge Logic | Supabase Edge Functions (Deno) |
| Notifications | flutter_local_notifications + timezone |
| Charts | fl_chart + table_calendar |
| Progress UI | percent_indicator |
| State | Riverpod |
| Offline Cache | Hive |

---

## Features

**Core**
- Create habits with name, icon, color, category, frequency (daily, weekdays, custom days), and target count
- Organize habits into named routines (morning, evening, workout)
- One-tap habit check-in with haptic confirmation
- Streak counter: current streak, longest streak, total completions
- GitHub-style 12-month heatmap per habit
- Weekly summary card: completion rate, missed days, best day

**Backend & Infrastructure**
- Supabase Auth with email/password and Apple Sign-In; user session persisted locally
- `habits`, `routines`, `completions` tables in Supabase PostgreSQL with Row Level Security — all queries scoped to `auth.uid()`
- Supabase Realtime subscription on `completions` — syncs completions live across two devices logged in to the same account
- Supabase Edge Function `streak-calculator`: runs on INSERT to `completions` table, recalculates streak and updates `habits.current_streak` atomically
- Supabase Edge Function `daily-digest`: scheduled cron at 8 PM — queries incomplete habits for the day and delivers a reminder payload to the notification service
- Hive local cache for offline check-in; pending completions queue is flushed and upserted to Supabase on reconnect
- PostgreSQL RLS policies block cross-user data access at the database level

**Notifications & Gamification**
- Per-habit configurable reminder times, stored as cron expressions and evaluated by the Edge Function
- Streak milestone celebrations (7, 30, 100 days) with confetti animation
- Streak protection: push notification 2 hours before midnight if habit is still incomplete
- Gentle failure reframing — app presents missed days as "rest days" and recalculates based on user-set intent

**UX**
- Drag-to-reorder habits within a routine
- Calendar view with completion dots per day
- Dark / light theme with system auto-switch

---

## Challenges

- Accurately computing streaks server-side when the user is in different time zones across sessions
- Preventing duplicate completions if the offline queue flushes twice on an unstable connection
- Keeping Hive and Supabase in sync when the user modifies a habit definition (not just a completion)

---

## Screenshots

_Dashboard · Habit Detail · Heatmap · Routines_

---

---

---

# Insightly

> A mobile analytics dashboard that surfaces business KPIs, trends, and actionable insights — all in one place.

---

## Overview

Insightly is a Flutter-based analytics dashboard app for tracking key business metrics. It provides real-time KPI summaries, revenue trend charts, goal tracking, and AI-style insight cards — giving users a 360° view of their data from a clean, modern mobile interface.

---

## Problem

Business data is scattered across tools — spreadsheets, BI platforms, CRMs, and ad dashboards. Decision-makers need a single mobile surface that aggregates the numbers that matter, visualises trends, and flags anomalies requiring attention.

---

## Solution

Insightly aggregates metrics into an intuitive dashboard with interactive charts, goal-progress tracking, and a curated insights feed. Users can review performance at a glance, drill into weekly/monthly reports, set measurable goals, and receive AI-generated insight cards that explain *why* numbers moved.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter 3 (Dart) |
| Charts | fl_chart ^0.68 |
| Localisation / Formatting | intl ^0.19 |
| Animations | flutter_staggered_animations ^1.1 |
| State management | Flutter built-in (StatelessWidget / StatefulWidget) |
| Platforms | Android · iOS · Web · macOS · Linux · Windows |

---

## Features

**Dashboard**
- KPI metric cards (revenue, users, conversion, session time, churn, NPS)
- Weekly revenue line chart with formatted axis labels
- Date-stamped greeting header

**Reports**
- Monthly revenue bar chart
- Traffic source breakdown (pie chart)
- Period-over-period comparison with trend indicators

**Goals**
- Measurable goals with progress bars and deadline tracking
- Status badges: On Track, At Risk, Completed

**Insights**
- Curated insight cards categorised as Positive, Warning, or Neutral
- Each insight links to the relevant metric with a short explanation

**Profile**
- User avatar (network image) with name and role
- Stats summary: reports generated, goals set, insights viewed
- App settings: notifications, dark mode, language, privacy

---

## Screens

| Screen | Description |
|---|---|
| Splash | Animated branded entry with logo |
| Dashboard | KPI metric grid + revenue chart |
| Reports | Bar & pie charts with period selector |
| Goals | Goal list with progress tracking |
| Insights | Insight card feed with category filter |
| Profile | User info, stats, and settings |

---

## Design

- **Palette**: Midnight Teal (`#0D7377`) primary, Warm Gold (`#FDCB6E`) secondary, Mint Green (`#00B894`) accent
- **Typography**: Rounded weight hierarchy (w900 → w500)
- **Cards**: Elevated white cards with subtle shadow on a cool-gray surface
- **Logo**: White-background rounded-corner icon used across splash, navigation, and footers

---

## Screenshots

_Splash · Dashboard · Reports · Goals · Insights · Profile_

---

---

---

# MoodLeaf

> A daily mood and journal app that finds the patterns behind how you feel.

---

## Overview

MoodLeaf is a mood tracking and journaling app that helps users log their daily emotional state, attach notes, and discover patterns over time. It surfaces mood trends by time of day, day of week, and tagged life areas — giving users authentic insight into what drives their emotional states.

---

## Problem

Mental well-being starts with self-awareness, but most people have no systematic record of how they feel and what factors correlate with their mood. Without data, it's hard to act on patterns or communicate them to a therapist or coach.

---

## Solution

MoodLeaf combines a simple daily check-in (emoji + intensity + tags + note) with an analytics layer that visualizes mood history, detects trends, and highlights recurring correlations. Entries are private, end-to-end in the user's account, and always accessible.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart) |
| Auth | Appwrite Auth (email + anonymous) |
| Database | Appwrite Database |
| Real-time | Appwrite Realtime |
| Storage | Appwrite Storage (optional media attachments) |
| State | flutter_bloc |
| Charts | fl_chart |
| Calendar | table_calendar |
| Notifications | flutter_local_notifications |
| Encryption | encrypt (AES-256 for journal text) |

---

## Features

**Core**
- Daily mood check-in: pick an emoji (10 options), set intensity (1–10), add free-text note
- Life area tags: Work, Health, Social, Sleep, Exercise, Family, Finance — multi-select per entry
- Monthly calendar view with color-coded mood dots per day
- Mood history list: scrollable log of all past entries with search
- Streak tracker for consecutive days logged

**Backend & Infrastructure**
- Appwrite Auth supports email/password signup and anonymous sessions (data migrates on account creation)
- Appwrite Database collections: `moods`, `tags`, `users` — document permissions restrict all reads/writes to the owning user ID
- Appwrite Realtime subscription on `moods` collection — syncs new entries across user devices instantly
- Appwrite Storage for optional photo or audio attachments per journal entry, with per-user bucket permissions
- Journal note text encrypted client-side with AES-256 (encrypt package) before writing to Appwrite; decrypted locally on read
- Appwrite Function `weekly-report`: runs on schedule Sunday night, aggregates mood scores for the week, writes a summary document used by the insights screen

**Analytics & Insights**
- Weekly and monthly average mood score with trend direction indicator
- Heatmap grid: 12-week mood intensity by day (fl_chart)
- Tag correlation: which life area tags appear most in high vs low mood entries
- Peak mood time analysis: morning / afternoon / evening average breakdown
- Lowest mood triggers: tags that co-occur with moods below user's personal average

**Notifications & Privacy**
- Daily check-in reminder at user-configured time via flutter_local_notifications
- Gentle nudge if no entry logged by 9 PM
- Journal text never stored in plaintext — all note content AES-256 encrypted before leaving the device
- Anonymous mode lets users explore the app without account creation

---

## Challenges

- AES key management: deriving a stable encryption key from the user's credentials without storing the key server-side
- Building meaningful tag correlation analytics on limited data (30–90 entries) without false pattern noise
- Appwrite Realtime reconnect behavior when the app returns from background on slow connections

---

## Screenshots

_Home · Log Entry · Calendar · Insights_

---

---

---

# NoteHarbor

> A native Android note-taking app with rich text, tagging, and seamless cloud sync.

---

## Overview

NoteHarbor is a feature-rich note-taking app built natively for Android. Users write formatted notes, organize with tags and folders, pin important items, and search across everything instantly. Notes sync to Firebase so they're available on any device the user signs into.

---

## Problem

Most Android users settle for a basic notes app that lacks formatting, tagging, or sync. Third-party note apps are often subscription-gated, slow, or have bloated feature sets that obscure simple writing. A fast, capable, sync-enabled notes app shouldn't require a paid plan.

---

## Solution

NoteHarbor provides a clean rich-text editor, fast tag and full-text search, folder organization, and reliable Firebase sync — without a subscription. Data is stored locally in Room first for instant access, then synced to Firestore when online.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Architecture | MVVM + Repository pattern |
| DI | Hilt |
| Local Storage | Room (SQLite) |
| Preferences | DataStore (Proto) |
| Auth | Firebase Authentication (email + Google) |
| Cloud Sync | Firebase Firestore |
| Rich Text | Compose RichText / Markwon |
| Async | Kotlin Coroutines + Flow |
| Navigation | Compose Navigation |
| Search | Room FTS4 full-text search |

---

## Features

**Core**
- Create and edit notes with rich text: bold, italic, headings, bullet lists, numbered lists, inline code
- Pin notes to keep them at the top of the list
- Organize notes into folders and assign multiple color-coded tags
- Archive notes without deleting them
- Trash with 30-day automatic recovery window
- Note word count and last-modified timestamp

**Backend & Infrastructure**
- Firebase Auth with email/password and Google OAuth; session token persisted and refreshed automatically via Firebase SDK
- Room as primary store: `notes`, `folders`, `tags`, `note_tags` tables with FTS4 virtual table for full-text search
- Firestore as sync layer: notes are written to Room first (instant local save), then written to Firestore `users/{uid}/notes/{noteId}` in the background
- Firestore real-time listener on the user's notes collection — changes on another device appear within seconds without a manual refresh
- Two-way sync conflict resolution: last-write-wins using `updated_at` timestamp comparison; user is never prompted
- DataStore records user preferences (theme, default font, sort order) and device-local sync metadata (last sync timestamp per device)
- Hilt provides ViewModel injected with repository, enabling unit testing of sync logic without Android framework dependencies

**Search & Organization**
- Room FTS4 full-text search across note titles and body text — results appear as the user types
- Filter by folder, tag, creation date, and pinned status
- Sort by last modified, alphabetical, or manual drag order
- Deep link to a note directly from Android home screen shortcut

**Sync & Offline**
- Full offline functionality — notes are written to Room immediately regardless of connectivity
- Pending Firestore writes queued and flushed on reconnect
- Sync status indicator: silent green dot (synced), yellow spinner (pending), red dot with retry (error)
- Note deletion is soft-deleted (Room + Firestore) and supports undo within 5 seconds

---

## Challenges

- Implementing reliable two-device, real-time sync with conflict resolution without a dedicated backend API
- Room FTS4 keeping in sync with the canonical notes table when notes are edited offline and synced later
- Handling the DataStore / Room migration gracefully when the schema changes across app versions

---

## Screenshots

_Notes List · Editor · Folders · Search_

---

---

---

# PantryPilot

> A smart grocery and pantry management app that eliminates food waste and forgotten purchases.

---

## Overview

PantryPilot helps households manage their pantry inventory, plan shopping lists, and track expiry dates. Users scan barcodes to add items, get low-stock and expiry alerts, and generate smart shopping lists based on what's running low or missing from saved recipes.

---

## Problem

Households routinely over-buy, forget what they already have, and let food expire. Without a live view of pantry contents, grocery shopping is imprecise and waste accumulates — both food and money.

---

## Solution

PantryPilot turns pantry management into a quick mobile habit. Add items via barcode scan or manual entry, set expiry dates, and let the app remind you when to replenish or use something up. Shopping lists build themselves from low-stock thresholds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.74 (TypeScript) + Expo SDK 51 |
| Auth | Supabase Auth (email + Google OAuth) |
| Database | Supabase PostgreSQL |
| Edge Logic | Supabase Edge Functions (Deno) |
| Storage | Supabase Storage (product images) |
| Barcode Scan | expo-barcode-scanner + Open Food Facts API |
| Notifications | Notifee (local, background-capable) |
| State | TanStack Query + Zustand |
| Navigation | Expo Router v3 |
| UI | NativeWind |

---

## Features

**Core**
- Pantry inventory list with item name, category, quantity, unit, and expiry date
- Barcode scanner: scans EAN/UPC barcodes and auto-fills product name and image via Open Food Facts API
- Manual item entry with category picker and custom units
- Shopping list: add items manually or auto-generate from low-stock rules
- Check off shopping list items and optionally add directly to pantry on checkout
- Multi-household support: invite family members to share a pantry

**Backend & Infrastructure**
- Supabase Auth manages user registration, login, and session refresh; household invite flow uses Supabase Auth email invites
- Supabase PostgreSQL schema: `households`, `pantry_items`, `shopping_lists`, `list_items`, `household_members` — all scoped with Row Level Security using `household_id` membership check
- Supabase Edge Function `expiry-checker`: Supabase cron runs nightly, queries items expiring within 3 days, writes a daily notification payload to a `pending_notifications` table consumed by the client on next open
- Supabase Edge Function `low-stock-trigger`: fires on UPDATE to `pantry_items.quantity` — if quantity drops below `reorder_threshold`, auto-inserts the item to the household's active shopping list
- Supabase Storage holds product images from barcode lookups; images deduped by barcode hash
- Open Food Facts API called server-side in the barcode Edge Function to avoid CORS and rate-limit issues on the client
- Notifee schedules foreground and background local notifications for expiry and restock alerts

**Household & Sharing**
- Invite by email: generates an invite token stored in Supabase, redeemed on accept
- Shared pantry: all household members see the same live inventory via TanStack Query polling
- Member permission roles: Owner and Member (Owner can remove members and delete the household)

**UX & Offline**
- Offline read: TanStack Query cache persisted to MMKV for pantry and shopping list data
- Writes queued in Zustand offline queue and flushed when connectivity restores
- Category-based pantry filter and search by item name
- Expiry visual: items expiring within 3 days highlighted in amber, expired in red

---

## Challenges

- Reliably scheduling nightly expiry checks on iOS where background execution is restricted
- Deduplicating Open Food Facts results for the same product from different regional barcode databases
- Handling household real-time sync when multiple members shop and check off items simultaneously

---

## Screenshots

_Pantry · Scanner · Shopping List · Household Settings_

---

---

---

# PingNest

> A real-time group messaging app built for fast, focused team and friend communication.

---

## Overview

PingNest is a real-time chat app designed for small groups and teams. Users create or join chat rooms, send messages with text and media, and see who's online. It supports direct messages, group channels, message reactions, and push notifications for unread messages.

---

## Problem

General-purpose messaging apps carry too much context and noise. Teams and close-knit groups need a simple, fast messaging experience without the complexity of enterprise tools or the distraction of consumer super-apps.

---

## Solution

PingNest keeps communication lean: channels, DMs, reactions, and real-time presence — nothing more. Firebase Realtime Database provides sub-second message delivery, and FCM delivers push notifications when users aren't in the app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.74 (TypeScript) |
| Auth | Firebase Authentication (email + Google + Anonymous) |
| Real-time Messaging | Firebase Realtime Database |
| File Storage | Firebase Cloud Storage |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Chat UI | react-native-gifted-chat |
| Navigation | React Navigation v6 |
| State | Context API + useReducer |
| Media | react-native-image-picker |
| Presence | Firebase Realtime Database (`.info/connected`) |

---

## Features

**Core**
- Create named group channels with description and optional invite-only toggle
- Direct messages: open a 1:1 conversation from any user profile
- Send text messages with URL auto-linking
- Photo and file attachments via image picker with upload progress
- Message reactions: tap-hold to add emoji reaction; reaction counts shown per message
- Read receipts on DMs (delivered / seen indicators)
- Online presence indicator on user avatars (green dot)

**Backend & Infrastructure**
- Firebase Auth with email/password, Google OAuth, and anonymous guest mode; guests prompted to register to retain history
- Firebase Realtime Database structure: `/channels/{id}/messages`, `/dms/{threadId}/messages`, `/users/{uid}/online` — all secured with Realtime Database Rules
- Database rules enforce: only channel members may read messages; only authenticated users may write; message author ID must match `auth.uid` on write
- Firebase Realtime Database presence system: client writes `{online: true, last_seen: ServerValue.TIMESTAMP}` on connect, cleared via `onDisconnect()` handler
- Firebase Cloud Storage for media: files stored at `/attachments/{channelId}/{messageId}/{filename}` with Storage rules restricting to channel members
- FCM push notification triggered by a Firebase Cloud Function on new message insert: reads recipient's FCM token from Firestore and sends notification with channel name and sender
- Firebase Cloud Functions: `onNewMessage` (sends FCM), `onUserDeleted` (cleans up messages and media), `buildUnreadCounts` (updates unread badge per user)

**Notifications & UX**
- FCM foreground and background notifications; tapping opens directly to the relevant channel or DM thread
- In-app notification badge on channel list for unread counts
- Message pagination — loads last 50 messages on open, older messages loaded on scroll-up
- Swipe-to-reply quoting the original message
- Animated typing indicator when another user is composing

**Offline & Reliability**
- Firebase Realtime Database offline mode enabled: messages queued locally and sent when connectivity restores
- Reconnect indicator banner when the app loses Firebase connection
- Exponential backoff on Realtime Database reconnect

---

## Challenges

- Building reliable unread message counts in Firebase Realtime Database without server-side aggregation support
- Preventing duplicate FCM notifications when a user has multiple active devices
- Implementing message pagination with react-native-gifted-chat's inverted list and Firebase cursored queries

---

## Screenshots

_Channel List · Chat Thread · DM · User Profile_

---

---

---

# PocketPulse

> A native Android personal finance app that puts your full financial picture in your pocket.

---

## Overview

PocketPulse is a personal finance tracker built natively for Android. Users log transactions manually, set category budgets, track spending against those budgets, and view monthly trends — all locally stored with optional cloud account backup. It gives a clean, honest view of where your money goes.

---

## Problem

Banking apps show transactions but offer no budgeting context. Spreadsheets work but have no mobile-native UX. Most finance apps are subscription-based with features the majority of users never touch. A capable local-first budgeting app accessible to everyone is missing.

---

## Solution

PocketPulse stores everything on-device in Room and presents spending data in clear charts and budget progress bars. No mandatory account, no ads. Optional Firebase backup for users who want to protect their data or access it across phones.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Architecture | Clean Architecture (MVVM + UseCases) |
| DI | Hilt |
| Local DB | Room (SQLite) |
| Networking | Retrofit 2 + OkHttp + Moshi |
| Auth (optional) | Firebase Authentication |
| Cloud Backup | Firebase Firestore |
| Background Jobs | WorkManager |
| Charts | Vico |
| Async | Kotlin Coroutines + Flow |

---

## Features

**Core**
- Log income and expense transactions with amount, category, date, note, and payment method
- Category management: create, color-code, and icon-assign custom categories
- Monthly budget: set a spending limit per category and track progress in real time
- Account management: track multiple accounts (cash, bank, card) with running balances
- Net worth summary: assets minus liabilities computed from account balances
- Transaction history with search, filter by category/account/date, and sort

**Backend & Infrastructure**
- Room as the single source of truth: `transactions`, `categories`, `accounts`, `budgets` tables with full relational integrity and foreign key constraints
- Hilt modules provide scoped UseCases injected into ViewModels, enabling full unit test coverage without Android framework
- WorkManager schedules a nightly budget-reset job (midnight on the 1st of the month) and a weekly spending-summary notification
- Firebase Auth: optional sign-in with email; user session persisted locally via Firebase SDK
- Firestore cloud backup: on demand or on login, all Room tables serialize to Firestore under `users/{uid}/finance/`
- Retrofit client configured for a currency exchangerate API (ECB endpoint): fetches daily rates on WiFi and caches in Room for multi-currency transaction conversion
- OkHttp interceptor attaches Firebase ID token to all authenticated API calls
- WorkManager periodic task fetches updated exchange rates every 24 hours when device is on WiFi and charging

**Analytics & Budgets**
- Monthly bar chart: spending per category with budget limit line overlay
- Trend line chart: net cash flow over the last 12 months
- Category breakdown pie chart with percentage share
- Budget alert: WorkManager task fires a notification when any category reaches 80% of its limit

**Offline & Privacy**
- Fully offline-first: all features work without account or connectivity
- Optional Firebase backup is the only network dependency
- No analytics SDKs; no telemetry
- Room database encrypted with SQLCipher if the user enables the app-lock PIN

---

## Challenges

- Implementing multi-currency conversion that stays accurate offline using cached exchange rates
- Designing the Room schema to handle transfers between accounts so they don't double-count spending
- WorkManager budget-reset job reliability across different Android OEM battery optimization layers

---

## Screenshots

_Dashboard · Transaction Log · Budget Tracker · Monthly Report_

---

---

---

# Savora

> A recipe discovery and meal planning app that brings every week's meals together in one place.

---

## Overview

Savora is a Flutter recipe app where users discover, save, and plan meals. Users browse a curated recipe feed, save recipes to named collections, build weekly meal plans by dragging recipes onto calendar days, and auto-generate a consolidated shopping list from the planned meals.

---

## Problem

People who cook at home face a fragmented workflow: recipes saved across browser bookmarks, social media saves, and paper notes; meal planning done mentally or in a notes app; and shopping lists rebuilt from scratch every week. There's no single tool for the full cycle.

---

## Solution

Savora closes the loop from recipe discovery to shopping cart. Find a recipe, save it, slot it into the week's plan, get your list. The app handles the kitchen logistics so users can focus on cooking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart) |
| Auth | Appwrite Auth (email + Google OAuth) |
| Database | Appwrite Database |
| Storage | Appwrite Storage (recipe cover images) |
| Backend | Appwrite Functions (Node.js) |
| State | flutter_bloc |
| Navigation | GoRouter |
| Animations | flutter_animate |
| Notifications | flutter_local_notifications |
| Offline | Hive |

---

## Features

**Core**
- Recipe feed: browse recipes by cuisine, meal type, cook time, and dietary label
- Recipe detail: ingredients list, step-by-step instructions, serving adjuster, nutrition summary
- Save recipes to named collections (Quick Meals, Date Night, Meal Prep)
- Weekly meal plan calendar: assign a recipe to any meal slot (breakfast, lunch, dinner) of any day
- Auto-generate shopping list from all ingredients across the week's planned meals — deduped and summed by unit
- Manual shopping list additions and cross-off-on-shop flow

**Backend & Infrastructure**
- Appwrite Auth with email/password and Google OAuth; sessions persisted in Appwrite's secure client store
- Appwrite Database collections: `recipes`, `collections`, `saved_recipes`, `meal_plans`, `shopping_lists` — document permissions scoped to owner user ID
- Appwrite Storage for cover images: recipes have cover images uploaded by content team; user-submitted recipe feature uses user-scoped buckets with 5 MB upload limit enforced on Storage rules
- Appwrite Function `generate-shopping-list`: triggered via HTTP call from client when user taps "Build My List" — reads all meal plan entries for the week, aggregates ingredient quantities across recipes, writes merged list to `shopping_lists` collection
- Appwrite Function `weekly-plan-notifications`: scheduled cron every Sunday evening — checks users with incomplete meal plans for the coming week, sends push payload to the notification service
- User-submitted recipes go through an Appwrite Function moderation step before being set to `status: published`
- Hive local cache for previously loaded recipes — app navigates and displays fully offline

**Discovery & UX**
- Infinite scroll feed with category and filter bar
- Full-text recipe search (title, ingredient, tag)
- Recipe rating and review — ratings stored in Appwrite with per-user uniqueness enforced by document permissions
- Ingredient substitution suggestions surfaced on the recipe detail page
- Shopping list item category grouping (Produce, Dairy, Meat, Pantry)
- Local notification reminder on Sunday at 7 PM if no meals are planned for the coming week

---

## Challenges

- Ingredient quantity aggregation across different recipes using inconsistent unit systems (cups vs ml vs grams)
- Implementing the meal plan calendar UI in Flutter with drag-and-drop recipe card assignment
- Keeping the offline Hive cache fresh when Appwrite recipe data is updated by the content team

---

## Screenshots

_Recipe Feed · Meal Plan · Shopping List · Collections_

---

---

---

# SkyPeek

> A beautiful weather app with hourly forecasts, severe weather alerts, and interactive radar maps.

---

## Overview

SkyPeek is a React Native weather app that delivers clean, accurate weather data for any location. Users see current conditions, hourly and 7-day forecasts, rainfall and UV index, and a live radar map — with push alerts for severe weather in saved locations.

---

## Problem

Stock weather apps on phones are functional but uninspiring, and third-party options are often cluttered with ads, require accounts for basic features, or bury the detailed data (hourly breakdowns, UV, air quality) behind paywalls or confusing UIs.

---

## Solution

SkyPeek surfaces rich weather data in an elegant, fast mobile UI. It uses the OpenWeatherMap API for live data, caches forecasts locally for offline viewing, and sends push alerts for thunderstorms, frost, or high UV without requiring the app to be open.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.74 (TypeScript) + Expo SDK 51 |
| Weather API | OpenWeatherMap One Call API 3.0 |
| Geocoding | OpenWeatherMap Geocoding API |
| Maps | react-native-maps + OpenWeatherMap tile layer |
| Notifications | Expo Notifications (scheduled + push) |
| Local Cache | AsyncStorage + MMKV |
| Location | expo-location |
| Navigation | Expo Router v3 |
| Charts | Victory Native XL |
| UI | NativeWind |
| Background Refresh | Expo Background Fetch |

---

## Features

**Core**
- Current conditions: temperature, feels like, humidity, wind speed/direction, pressure, visibility
- Hourly forecast: 48-hour breakdown with temperature and precipitation probability per hour
- 7-day forecast with daily high/low, weather description, sunrise/sunset times
- UV index with safety rating and exposure recommendations
- Air quality index (AQI) with PM2.5 and ozone breakdown
- Moon phase indicator

**Backend & API Integration**
- OpenWeatherMap One Call API 3.0 fetches current + hourly + daily + air quality in a single request
- Geocoding API converts city name search to lat/lon for any saved location
- API key stored in Expo SecureStore, never bundled in plain config
- All API responses cached to MMKV (JSON) with a TTL of 30 minutes; stale data displayed immediately while a fresh fetch runs in background
- Expo Background Fetch task runs every 30 minutes (iOS permitted background time) to update alert-monitored locations without opening the app
- Expo Notifications: if the background fetch detects a thunderstorm, frost (<2°C), or UVI >8 for a user's saved location, it fires a local push notification
- No user account or backend server required — all logic runs on-device with OpenWeatherMap as the only external dependency

**Locations & Maps**
- Save up to 10 favourite locations with drag-to-reorder
- Auto-detect current location via expo-location with fallback to last known location offline
- Interactive radar map layer: OpenWeatherMap precipitation tile layer overlaid on react-native-maps
- Location search with debounced geocoding query and result list

**UX**
- Dynamic background gradient that shifts from midnight blue to amber based on time of day and conditions
- Weather condition animations (animated rain, sun rays, cloud drift) using React Native Animated API
- Temperature unit toggle (°C / °F) persisted in MMKV
- Swipe between saved locations on the home screen
- Widget-like compact view for home screen (Expo Widgets — planned)

**Offline**
- MMKV persisted cache serves full forecast data offline
- Stale indicator shown if data is older than TTL; explicit "Refresh" button always available

---

## Challenges

- Background Fetch on iOS is not guaranteed to run on schedule — alert notifications may be delayed on low-battery or restricted devices
- Merging the tile layer for radar precipitation onto react-native-maps without performance degradation on lower-end Android devices
- Animating weather backgrounds smoothly while rendering complex chart data simultaneously without frame drops

---

## Screenshots

_Current Conditions · Hourly Forecast · Radar Map · Saved Locations_

---

---

---

# TaskNest

> A native Android task manager with smart scheduling, recurring tasks, and team workspaces.

---

## Overview

TaskNest is a Kotlin-native Android task management app supporting personal to-dos and shared team workspaces. Users create tasks with due dates, priorities, subtasks, and labels; set flexible recurrence rules; and get reminded by the system at the right time — even when the app is closed. Teams share workspace boards with real-time collaborative updates.

---

## Problem

Lightweight to-do apps don't scale to team use. Project management tools are too heavyweight for personal use. Users need a single app that handles both a personal inbox and lightweight team task boards without requiring a subscription for core features.

---

## Solution

TaskNest separates personal tasks from workspace boards within one app. Personal tasks are local-first in Room; workspace tasks sync and collaborate via Supabase in real time. WorkManager handles reliable reminder scheduling across all Android power management regimes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Architecture | Clean Architecture (MVVM + UseCases + Repository) |
| DI | Hilt |
| Local DB | Room (SQLite) |
| Preferences | DataStore (Proto) |
| Background Jobs | WorkManager |
| Auth | Supabase Auth (email + Google OAuth) |
| Sync | Supabase PostgreSQL + Realtime |
| Async | Kotlin Coroutines + Flow |
| Navigation | Compose Navigation |

---

## Features

**Core**
- Create tasks with title, description, due date/time, priority (P1–P4), and labels
- Subtask checklist within a task with independent completion tracking
- Flexible recurrence rules: daily, weekly (specific days), monthly (specific date), or custom interval
- Multiple list views: Today, Upcoming, By Project, All Tasks, Completed Archive
- Bulk actions: complete, reschedule, assign label, or delete selected tasks
- Personal inbox for quick-capture tasks without a due date

**Backend & Infrastructure**
- Supabase Auth with email/password and Google OAuth; access tokens stored securely in DataStore, not SharedPreferences
- Room as local store for personal tasks: `tasks`, `subtasks`, `labels`, `task_labels` tables — all operations on personal tasks are fully offline
- WorkManager `ReminderWorker`: scheduled at exact task due time using `setExactAndAllowWhileIdle`; re-enqueued after device reboot via `BootBroadcastReceiver`
- WorkManager `RecurrenceWorker`: runs after a recurring task is completed, computes next due date using the recurrence rule, creates the next task instance in Room
- Supabase PostgreSQL tables: `workspaces`, `workspace_members`, `workspace_tasks`, `workspace_subtasks` — all scoped with Row Level Security based on workspace membership
- Supabase Realtime subscription on `workspace_tasks` — changes made by any team member appear instantly for all active members without polling
- Supabase Auth used for workspace invite flow: invite by email generates a Supabase Auth invite link; recipient joins workspace on account creation
- DataStore stores user preferences: default list view, reminder sound, theme, last selected workspace

**Workspaces & Collaboration**
- Create or join team workspaces with a unique invite link or email invite
- Board view and list view switchable per workspace
- Assign workspace tasks to members; assignee sees tasks in their personal Today/Upcoming views
- Comment thread per workspace task with real-time updates via Supabase Realtime
- Activity log per workspace: task created, completed, reassigned, commented — with actor and timestamp

**Notifications**
- WorkManager `ExactAlarmCompat` reminder built with `AlarmManager.setAlarmClock` for Android 12+ exact alarm permission
- Notification channels: Task Reminders, Workspace Activity, Daily Digest
- Daily digest: WorkManager periodic task at 8 AM — queries today's tasks and posts a summary notification
- Workspace activity notification: FCM (via Supabase webhooks to a Deno Edge Function sending FCM) for mentions and assignments

**Offline**
- Personal tasks: fully offline, no connectivity needed
- Workspace tasks: Supabase offline write queue — changes made offline are flushed on reconnect
- Supabase Realtime auto-reconnect with exponential backoff handled by the Supabase Kotlin client

---

## Challenges

- Ensuring WorkManager exact alarm reminders survive OEM-specific battery optimizations (Huawei, Xiaomi, Samsung) without requesting unrestricted battery access
- Merging offline-queued workspace task updates with real-time Supabase changes without creating duplicates
- Implementing a flexible recurrence engine in pure Kotlin that matches iCalendar RRULE semantics

---

## Screenshots

_Today View · Task Detail · Workspace Board · Reminders_

---

---

---

# TradeLoop

> A peer-to-peer marketplace app for trading, selling, and discovering second-hand goods locally.

---

## Overview

TradeLoop is a Flutter mobile marketplace where users list items for sale or trade, browse listings by category and location, make offers, and complete deals through an in-app chat. It focuses on local discovery and trust — buyer and seller profiles include ratings, transaction history, and verified location.

---

## Problem

General classifieds apps are cluttered with scam listings, have poor mobile UX, and don't distinguish between sellers who want cash only and those open to trades. Peer-to-peer commerce deserves an app built mobile-first with real-time messaging and structured offer flows.

---

## Solution

TradeLoop focuses on trusted local commerce. Listings specify if the seller wants cash, trade, or both. Offers are structured (counter-offer supported), messaging is real-time via Supabase Realtime, and both parties rate the transaction — building a seller/buyer reputation over time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart) |
| Auth | Supabase Auth (email + Google OAuth + phone OTP) |
| Database | Supabase PostgreSQL |
| Real-time Chat | Supabase Realtime |
| Storage | Supabase Storage (listing photos) |
| Edge Logic | Supabase Edge Functions (Deno) |
| State | Riverpod |
| Navigation | GoRouter |
| Location | geolocator + geocoding |
| Payments | Pay (Google Pay / Apple Pay — placeholder flow) |
| Push | flutter_local_notifications + Supabase webhooks |

---

## Features

**Core**
- Create listings: up to 8 photos, title, description, category, asking price, trade preference (Cash / Trade / Both), condition, and location
- Browse listings by category, distance radius, price range, and deal type
- Save listings to a watchlist with price-drop notification
- Make structured offers: cash offer, trade proposal, or counter-offer
- Offer flow: Pending → Accepted / Declined / Countered → Completed
- In-app real-time chat per deal thread (between buyer and listing)
- Listing expiry: auto-marked stale after 30 days with re-list prompt

**Backend & Infrastructure**
- Supabase Auth with email/password, Google OAuth, and SMS OTP for phone verification; verified phone increases seller trust badge score
- Supabase PostgreSQL schema: `listings`, `offers`, `messages`, `users`, `ratings`, `watchlist_items` — all tables protected by Row Level Security
- RLS rules: a message can only be created in a thread tied to the message author's offer; only listing owner can update listing status
- Supabase Realtime subscription on `messages` table filtered by `thread_id` — live message delivery without polling
- Supabase Storage for listing photos: images stored at `/listings/{listingId}/{index}` with 10 MB per-image limit enforced in Storage rules; CDN URL returned for rendering
- Supabase Edge Function `offer-accepted-hook`: fires on UPDATE to `offers.status = 'accepted'` — marks competing offers on the same listing as `withdrawn`, notifies affected buyers, creates a `deal` record
- Supabase Edge Function `price-drop-notifier`: runs on UPDATE to `listings.price` — queries `watchlist_items` for that listing, writes push payload to `pending_notifications` table
- Supabase Edge Function `listing-expiry-cron`: daily cron — marks listings older than 30 days without a completed deal as `stale`, sends re-list prompt to seller
- Supabase webhooks forward database events to the Edge Functions via the built-in webhook system

**Trust & Ratings**
- Mutual rating after a deal: 1–5 stars with optional text review, stored per transaction
- Seller and buyer aggregate rating scores displayed on profile
- Transaction count badges (5+, 25+, 100+ trades)
- Report listing flow: Edge Function routes report to a moderation queue

**UX & Discovery**
- Map view of listings within desired radius using geolocator + Google Maps SDK
- Distance label on every listing card (e.g., "2.3 km away")
- Listings feed with infinite scroll and cursor-based pagination
- Price negotiation chat templates: quick-reply buttons with common offer phrases
- Offline watchlist cache in Riverpod; full refresh on next app open

---

## Challenges

- Designing offer state transitions that handle concurrent buyers without race conditions in Supabase PostgreSQL
- Keeping real-time chat performant when a single user has dozens of active deal threads open simultaneously
- Supabase Storage CDN image delivery performance for listings with 8 images on lower-bandwidth connections

---

## Screenshots

_Browse Listings · Listing Detail · Offer Flow · Deal Chat_
