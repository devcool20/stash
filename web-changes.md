# Web UI/UX Porting Roadmap

The following design refinements and features from the Android mobile app must be implemented in the web application:

## 1. Modals & Snappy Transitions
- **Spring Transition Optimization**: Replace default modal slide animations with fast-damping spring transitions.
- **Segmented Control Redesign**: Upgrade tabs in the "Add Stash" modal to a unified glassy segmented control.
- **Opacity adjustment**: Increase modal container opacity (reduce transparency to match `rgba(10, 10, 10, 0.95)` on dark backgrounds).

## 2. Default Add Mode
- Set **Screenshot/Image mode** as the primary default tab.
- Place **Web Link mode** second.

## 3. Focus Inspector & Sizing Fixes
- **Image Cutoff**: Change parent container sizing and set `object-fit: contain` to prevent portrait screenshot layout cutoffs.
- **Full-Screen Zoomable Viewer**: Implement a modal overlay allowing users to view the image in full resolution, with support for browser zoom or double-tap-to-zoom controls.

## 4. Branding Splash Screen
- Replicate the animated "Stash" liquid wave typography SVG mask and the Lottie bird animation in a centered overlay that shows for exactly 3 seconds and fades out cleanly on boot.
