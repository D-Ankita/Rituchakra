# RevenueCat + Play Store India

**Status:** research note

RevenueCat wraps StoreKit · Google Play Billing · web billing. Supports UPI Autopay for recurring subscriptions since Nov 2022. Transactions over ₹15,000 require PIN each time. **Important:** PayTM UPI was cut off Aug 2025 — users now must have Google Pay, PhonePe, BHIM, or PayZapp. Nearly 30% of Play Store subscription cancellations are involuntary billing failures — design for graceful retry UX.

**Sources:**
- https://www.revenuecat.com/docs/getting-started/installation/reactnative
- https://blog.google/intl/en-in/products/platforms/now-pay-for-subscriptions-via-upi-on-google-play/
