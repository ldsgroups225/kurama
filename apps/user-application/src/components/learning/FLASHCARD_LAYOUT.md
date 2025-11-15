# Flashcard Session Layout

```
┌─────────────────────────────────────────────────────────┐
│  [X]              2 / 43                    [⚙️]         │ ← Sticky Header
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ← Progress (1px)
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                           │
│    ┌─────┐                              ┌─────┐          │
│    │  1  │                              │  0  │          │ ← Counter Badges
│    └─────┘                              └─────┘          │   (Incorrect | Correct)
│   Warning                               Success          │
│                                                           │
│                                                           │
│    ┌───────────────────────────────────────────┐        │
│    │  [🔊]                          [⭐]       │        │
│    │                                            │        │
│    │                                            │        │
│    │                                            │        │
│    │                                            │        │
│    │              meiosis                       │        │ ← Flashcard
│    │                                            │        │   (500px min)
│    │                                            │        │
│    │                                            │        │
│    │                                            │        │
│    │      Appuyez pour retourner               │        │
│    └───────────────────────────────────────────┘        │
│                                                           │
│                                                           │
│              ┌─────┐        ┌─────┐                     │
│              │  ↻  │        │  ✓  │                     │ ← Action Buttons
│              └─────┘        └─────┘                     │   (When flipped)
│             Warning        Success                       │
│                                                           │
│                                                           │
│                  ←          →                            │ ← Navigation
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Swipe Gesture States

### Swiping Right (Correct)

```
┌───────────────────────────────────────────┐
│                                            │
│         ╔═══════════════════╗             │
│         ║                   ║             │
│         ║    ✓ Connu        ║  →→→       │
│         ║                   ║             │
│         ╚═══════════════════╝             │
│                                            │
│         Green overlay appears              │
│         Card rotates +15°                  │
└───────────────────────────────────────────┘
```

### Swiping Left (Incorrect)

```
┌───────────────────────────────────────────┐
│                                            │
│      ←←←  ╔═══════════════════╗           │
│           ║                   ║           │
│           ║  ↻ En cours       ║           │
│           ║                   ║           │
│           ╚═══════════════════╝           │
│                                            │
│         Orange overlay appears             │
│         Card rotates -15°                  │
└───────────────────────────────────────────┘
```

## Settings Modal

```
┌─────────────────────────────────────────────┐
│                                               │
│              Options                          │
│  ─────────────────────────────────────────   │
│                                               │
│  [🔀]  Mélanger      [🔊]  Synthèse vocale   │
│                                               │
│  ─────────────────────────────────────────   │
│                                               │
│  Orientation des cartes                       │
│                                               │
│  ┌──────────┐  ┌──────────┐                 │
│  │  Terme   │  │Définition│                 │
│  └──────────┘  └──────────┘                 │
│     Active       Inactive                     │
│                                               │
│  Recto                                        │
│                                               │
│  ─────────────────────────────────────────   │
│                                               │
│  Parcourir à nouveau les cartes               │
│                                               │
└─────────────────────────────────────────────┘
```

## Animation Timeline

### Card Entrance (200ms)

```
Frame 0:   scale(0.8), opacity(0)
Frame 100: scale(0.9), opacity(0.5)
Frame 200: scale(1.0), opacity(1.0)
```

### Flip Animation (200ms)

```
Frame 0:   rotateY(0deg)   - Front visible
Frame 50:  rotateY(45deg)  - Transitioning
Frame 100: rotateY(90deg)  - Edge view
Frame 150: rotateY(135deg) - Transitioning
Frame 200: rotateY(180deg) - Back visible
```

### Swipe Gesture (Continuous)

```
Drag Distance:  -200px  -100px   0px   +100px  +200px
Rotation:        -15°     -7°     0°     +7°     +15°
Opacity:         0.5      1.0     1.0    1.0     0.5
Overlay:         100%     50%     0%     50%     100%
```

## Responsive Breakpoints

### Mobile (< 640px)

- Full width cards
- Larger touch targets (64px buttons)
- Simplified animations
- Swipe-first interaction

### Tablet (640px - 1024px)

- Max width 640px (lg)
- Centered layout
- Both swipe and click
- Full feature set

### Desktop (> 1024px)

- Max width 640px (lg)
- Centered layout
- Mouse drag support
- Keyboard shortcuts (future)

## Color Mapping

| Element             | Light Mode    | Dark Mode     |
| ------------------- | ------------- | ------------- |
| Background          | White         | Dark Gray     |
| Card                | White         | Dark Gray     |
| Border (Term)       | Primary/20    | Primary/20    |
| Border (Definition) | Success/20    | Success/20    |
| Incorrect Badge     | Warning/10 bg | Warning/10 bg |
| Correct Badge       | Success/10 bg | Success/10 bg |
| Swipe Left Overlay  | Warning/20    | Warning/20    |
| Swipe Right Overlay | Success/20    | Success/20    |

## Interaction States

### Card States

1. **Idle** - Front side, no interaction
2. **Flipping** - Animation in progress
3. **Flipped** - Back side visible
4. **Dragging** - User swiping
5. **Exiting** - Moving to next card

### Button States

1. **Default** - Normal appearance
2. **Hover** - Slight scale, color change
3. **Active** - Pressed state
4. **Disabled** - Grayed out, no interaction

### Modal States

1. **Closed** - Hidden
2. **Opening** - Fade in animation
3. **Open** - Fully visible
4. **Closing** - Fade out animation
