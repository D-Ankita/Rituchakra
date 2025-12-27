import { Phase } from '../types/phase';

const SCIENCE_INSIGHTS: Record<Phase, string[]> = {
  menstrual: [
    'Your body is renewing. Rest is productive during this phase.',
    'Iron-rich foods like spinach and lentils may help replenish what your body needs.',
    'Gentle stretching or a slow walk can ease discomfort more than staying still.',
    'This is a great time for reflection and planning rather than high-intensity tasks.',
    'Warmth \u2013 a cup of chai, a warm compress \u2013 can be your best friend right now.',
  ],
  follicular: [
    'Estrogen is rising \u2013 many people feel more creative and energetic now.',
    'Your brain may be especially sharp. Good time for learning or problem-solving.',
    'This phase often brings a natural boost in motivation and social energy.',
    'Your body tends to recover faster from exercise during this phase.',
    'Planning ahead? This is when many people feel most optimistic and forward-looking.',
  ],
  ovulation: [
    'Energy and confidence tend to peak around ovulation for many people.',
    'You may feel more social and communicative \u2013 a natural strength of this phase.',
    'This is typically when estrogen reaches its highest point in the cycle.',
    'Your body temperature may rise slightly \u2013 this is completely normal.',
    'Many people find this is their most productive time. Channel it well.',
  ],
  luteal: [
    'Progesterone is rising. Your body is shifting toward a quieter rhythm.',
    'Cravings are common and normal \u2013 your body may need more fuel right now.',
    'Focus and deep work can still be strong early in this phase.',
    'As the phase progresses, prioritize rest and gentle routines.',
    'Magnesium-rich foods like dark chocolate and nuts may help with comfort.',
  ],
};

const AYURVEDA_INSIGHTS: Record<Phase, string[]> = {
  menstrual: [
    'Some people find warm, grounding meals help root shifting Vata energy.',
    'Traditional practices suggest a warm sesame oil foot massage for deeper rest.',
  ],
  follicular: [
    'As building Kapha energy rises, light, warm foods can prevent sluggishness.',
    'Some traditions recommend ginger or black pepper to keep energy moving.',
  ],
  ovulation: [
    'Cooling foods like cucumber and mint can balance the natural Pitta heat of this phase.',
    'Some find that avoiding overly spicy foods keeps digestion calm right now.',
  ],
  luteal: [
    'Some find that warm, spiced milk at night helps quiet the mind before sleep.',
    'Traditional wisdom suggests protecting your energy \u2013 say no to extra commitments.',
  ],
};

export function getRandomInsight(phase: Phase, ayurvedaEnabled = false): string {
  const messages = [...SCIENCE_INSIGHTS[phase], ...(ayurvedaEnabled ? AYURVEDA_INSIGHTS[phase] : [])];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getInsightForDay(phase: Phase, dayIndex: number, ayurvedaEnabled = false): string {
  const messages = [...SCIENCE_INSIGHTS[phase], ...(ayurvedaEnabled ? AYURVEDA_INSIGHTS[phase] : [])];
  return messages[dayIndex % messages.length];
}
