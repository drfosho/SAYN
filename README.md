# SAYN - Social Accountability for Your Natural Progress

<div align="center">

![SAYN Logo](assets/images/SAYN%20LOGO.png)

**No Filters. No Fakes. Just Results.**

A fitness social platform that rewards authenticity, transparency, and real progress over vanity metrics.

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Development](#development) • [Roadmap](#roadmap)

</div>

---

## 🎯 Vision

SAYN is building a fitness community where honesty matters more than followers. We're creating a space where both natural and enhanced athletes are respected equally—because transparency is what builds trust.

Tired of fake natties setting unrealistic expectations? Tired of influencers hiding their steroid use while selling programs? SAYN flips the script: **verified content earns more XP, honest disclosure is celebrated, and authenticity is the currency.**

This is a **prototype/early-stage build** as we validate the concept and refine the experience. We're iterating quickly based on real user feedback.

---

## ✨ Features

### 🔥 Core Experience
- **Progress Posts** - Share your fitness journey with photo uploads (verified or unverified)
- **Post Types** - Daily Check-In, Progress Update, Peak Condition, or Just Sharing
- **XP System** - Earn experience points for posting, engaging, and maintaining streaks
- **Rank System** - Progress from Rookie → Warrior → Titan → Superhuman → God Tier
- **Power Ups** - Give energy to posts you respect (limited daily, keeps it meaningful)
- **Comments** - Engage with the community, reply to comments, power up thoughtful feedback

### 💎 Authenticity Features
- **AI Verification (Optional)** - Get your progress photos verified for +50% XP bonus
- **Natural Badge** - Earn verification through consistent authentic progress (strict requirements)
- **Enhanced Badge** - Transparency about PED use is honored, not shamed
- **Anti-Fake Natty** - Community reporting system to protect natural athletes from false claims

### 🏆 Gamification
- **Daily Streaks** - Post daily to build XP multipliers (up to 1.5x at 5+ days)
- **Milestones** - Unlock badges at 7, 30, 100, 365 day streaks
- **Leaderboards** - All-Time XP, Weekly XP, Longest Streaks, Highest Verification Rate
- **Weekly Recap** - See your stats, highlights, and motivation every Monday
- **Daily Challenges** - Optional bonus XP challenges (post verified photo, give 5 power ups, etc.)

### 👥 Social
- **Follow System** - Build your fitness circle
- **Search & Discover** - Find users by rank, location, badge type, or goals
- **Notifications** - Stay updated on power ups, comments, follows, achievements
- **Profile Customization** - Avatar, bio, location, experience level, fitness goals

### 🎨 Design Philosophy
- **Dark, Intense Aesthetic** - Angular shapes, bold borders, electric cyan/pink/orange energy
- **No Cartoons** - Tough, powerful, serious vibe
- **Sharp Animations** - 150-200ms timing, no bounce effects
- **Clear Feedback** - Visual XP toasts, level up celebrations, instant state updates

---

## 🛠 Tech Stack

**Frontend**
- **React Native** - Cross-platform mobile (iOS/Android)
- **Expo** - Development framework and build tooling
- **TypeScript** - Type safety and better DX
- **Expo Router** - File-based navigation

**Backend**
- **Supabase** - PostgreSQL database, authentication, real-time subscriptions, storage
- **Row Level Security (RLS)** - Database-level authorization
- **Edge Functions** - Serverless functions for complex operations

**AI & APIs**
- **Anthropic Claude API** - Progress comparison analysis (before/after photos)
- **Hive AI / Sensity.ai** - Image verification for authenticity (planned)

**State & Storage**
- **React Hooks** - Local state management
- **AsyncStorage** - Client-side persistence
- **Supabase Real-time** - Live updates for comments, notifications

**Media**
- **Expo Image Picker** - Camera and photo library access
- **Supabase Storage** - Avatar and post image hosting

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo Go app (for mobile testing) OR
- iOS Simulator / Android Emulator

### Installation
```bash
# Clone the repository
git clone https://github.com/drfosho/SAYN.git
cd SAYN

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npx expo start
```

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_claude_api_key
```

### Running the App

**On Mobile (Recommended)**
1. Install Expo Go on your phone
2. Scan QR code from terminal
3. App loads on your device

**On iOS Simulator**
```bash
npx expo run:ios
```

**On Android Emulator**
```bash
npx expo run:android
```

---

## 💻 Development

### Project Structure
```
SAYN/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Feed screen
│   │   ├── leaderboard.tsx      # Leaderboard
│   │   ├── search.tsx           # Search & discover
│   │   ├── profile.tsx          # User profile
│   │   └── _layout.tsx          # Tab navigator config
│   ├── auth/                     # Authentication screens
│   ├── comments/                 # Comments screen
│   ├── badge-verification/       # Badge application flow
│   ├── edit-profile.tsx         # Profile editing
│   ├── upload.tsx               # Post creation
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable components
│   ├── common/                  # Shared UI components
│   ├── posts/                   # Post-related components
│   ├── comments/                # Comment components
│   ├── xp/                      # XP system components
│   └── badges/                  # Badge components
├── lib/                         # Business logic
│   ├── api/                     # Supabase API functions
│   │   ├── posts.ts
│   │   ├── comments.ts
│   │   ├── xp.ts
│   │   ├── badges.ts
│   │   └── ...
│   ├── imagePicker.ts          # Image selection utilities
│   └── supabase.ts             # Supabase client
├── constants/                   # App constants
├── assets/                      # Images, fonts, etc.
└── supabase/                    # Database migrations (if using)
```

### Key Features Implementation

**XP System**
- Posts award XP based on type (0-40 XP)
- Streak multipliers increase XP (1.0x → 1.5x)
- Verified posts get +50% bonus
- Power ups award XP to both giver and receiver
- Level calculated from total XP
- Rank determined by XP thresholds

**Badge Verification**
- Natural: 30+ days, 10+ verified posts, 70%+ verification rate, AI physique check
- Enhanced: Self-disclosure or community verification, transparency commitment
- Under Review: Triggered by community reports (5+ fake natty reports)
- Admin verification required for final approval

**Real-time Features**
- Comments update live via Supabase subscriptions
- Notifications arrive instantly
- Feed refreshes on new posts

---

## 🗺 Roadmap

### ✅ Phase 1: Core MVP (Current)
- [x] User authentication & profiles
- [x] Post creation (photo + text)
- [x] XP and leveling system
- [x] Power ups and comments
- [x] Basic badge verification flow
- [x] Leaderboards
- [x] Search & discover
- [x] Notifications
- [x] Daily streaks

### 🚧 Phase 2: Enhanced Features (In Progress)
- [ ] AI image verification (Hive AI integration)
- [ ] Progress comparison with Claude vision
- [ ] Coach directory and profiles
- [ ] Direct messaging
- [ ] Advanced search filters
- [ ] Weekly recap polish
- [ ] Daily challenges expansion

### 🔮 Phase 3: Community & Growth
- [ ] Community guidelines and moderation
- [ ] User reporting and appeals system
- [ ] Transformation stories section
- [ ] Training program sharing
- [ ] Workout logging integration
- [ ] Apple Health / Google Fit sync
- [ ] Social sharing (Instagram, X)

### 🎯 Phase 4: Monetization
- [ ] Premium subscription (extended features)
- [ ] Coach monetization platform
- [ ] Sponsored challenges
- [ ] Brand partnerships (supplement companies)
- [ ] Verified coach certification program

---

## 🤝 Contributing

This is currently a **solo project in early prototype phase**. Not accepting contributions at this time, but feel free to:
- Open issues for bugs you find
- Suggest features via discussions
- Share feedback on the concept

Once we're further along, we'll open up contribution guidelines.

---

## 📝 Development Notes

### Built With AI Assistance
This project was built with significant assistance from **Claude Code** (Anthropic's AI coding assistant). Claude helped with:
- Architecture decisions and best practices
- Component implementations
- Database schema design
- Bug fixes and debugging
- Feature implementation

However, all product vision, design decisions, feature priorities, and user experience direction came from human creativity and domain expertise. AI was a powerful tool to accelerate development, not a replacement for human judgment.

### Why We're Transparent About This
Just like SAYN values honesty about natural vs. enhanced athletes, we believe in transparency about how this app was built. AI tools are revolutionizing software development, and we're proud to use them effectively while maintaining creative control and product vision.

---

## 📄 License

Copyright © 2025 SAYN / Godbey Property Ventures LLC

All rights reserved. This is proprietary software currently in prototype phase.

---

## 📧 Contact

**Founder:** kdog
**Email:** kevin@dealsletter.io
**X/Twitter:** @kdogbuilds

---

## 🙏 Acknowledgments

- **Anthropic** - Claude API for AI verification features and development assistance
- **Supabase** - Incredible backend-as-a-service platform
- **Expo** - Making React Native development accessible
- **The Fitness Community** - For inspiring this mission to fight fake natty culture

---

<div align="center">

**SAYN - Where Honesty Builds Strength**

Built with 💪 by real lifters, for real lifters.

</div>
