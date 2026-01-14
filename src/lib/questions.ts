import type { QuestionCategory } from './types';

interface QuestionData {
  text: string;
  category: QuestionCategory;
}

export const QUESTIONS: QuestionData[] = [
  // Gratitude (15 questions)
  { text: "What made you smile today?", category: "gratitude" },
  { text: "What are three things you're grateful for right now?", category: "gratitude" },
  { text: "Who made a positive difference in your day?", category: "gratitude" },
  { text: "What simple pleasure did you enjoy today?", category: "gratitude" },
  { text: "What's something beautiful you noticed today?", category: "gratitude" },
  { text: "What comfort do you often take for granted?", category: "gratitude" },
  { text: "What ability or skill are you thankful to have?", category: "gratitude" },
  { text: "What memory are you most grateful for?", category: "gratitude" },
  { text: "What technology made your life easier today?", category: "gratitude" },
  { text: "What food did you enjoy eating today?", category: "gratitude" },
  { text: "What moment of peace did you experience today?", category: "gratitude" },
  { text: "What about your home makes you feel grateful?", category: "gratitude" },
  { text: "What aspect of your health are you thankful for?", category: "gratitude" },
  { text: "What unexpected kindness did you receive recently?", category: "gratitude" },
  { text: "What lesson are you grateful to have learned?", category: "gratitude" },

  // Growth (15 questions)
  { text: "What lesson did you learn this week?", category: "growth" },
  { text: "What skill would you like to develop further?", category: "growth" },
  { text: "What mistake taught you something valuable?", category: "growth" },
  { text: "How have you grown as a person this year?", category: "growth" },
  { text: "What habit are you trying to build?", category: "growth" },
  { text: "What area of your life needs more attention?", category: "growth" },
  { text: "What knowledge do you wish you had gained sooner?", category: "growth" },
  { text: "What's one thing you could do better tomorrow?", category: "growth" },
  { text: "What feedback have you received that helped you improve?", category: "growth" },
  { text: "What book, podcast, or article taught you something new?", category: "growth" },
  { text: "What challenge helped you become stronger?", category: "growth" },
  { text: "What old belief have you reconsidered recently?", category: "growth" },
  { text: "What would your ideal self do differently?", category: "growth" },
  { text: "What's something you used to struggle with but have improved at?", category: "growth" },
  { text: "What learning opportunity are you excited about?", category: "growth" },

  // Reflection (20 questions)
  { text: "What would you tell your younger self?", category: "reflection" },
  { text: "What's on your mind right now?", category: "reflection" },
  { text: "How are you really feeling today?", category: "reflection" },
  { text: "What's something you've been avoiding?", category: "reflection" },
  { text: "What decision are you currently facing?", category: "reflection" },
  { text: "What do you need to let go of?", category: "reflection" },
  { text: "What's been weighing on your heart lately?", category: "reflection" },
  { text: "What brings you the most peace?", category: "reflection" },
  { text: "What's something you need to forgive yourself for?", category: "reflection" },
  { text: "What would make today meaningful?", category: "reflection" },
  { text: "What's your current state of mind in one word?", category: "reflection" },
  { text: "What do you wish others understood about you?", category: "reflection" },
  { text: "What are you most proud of about yourself?", category: "reflection" },
  { text: "What's something you've been putting off that you know you should do?", category: "reflection" },
  { text: "How did you take care of yourself today?", category: "reflection" },
  { text: "What boundaries do you need to set or maintain?", category: "reflection" },
  { text: "What's draining your energy lately?", category: "reflection" },
  { text: "What's giving you energy lately?", category: "reflection" },
  { text: "If today was your last day, what would you want to do?", category: "reflection" },
  { text: "What season of life are you in right now?", category: "reflection" },

  // Future (15 questions)
  { text: "Where do you see yourself in 5 years?", category: "future" },
  { text: "What are you looking forward to?", category: "future" },
  { text: "What goal are you working toward?", category: "future" },
  { text: "What would you do if you knew you couldn't fail?", category: "future" },
  { text: "What does your ideal day look like?", category: "future" },
  { text: "What legacy do you want to leave?", category: "future" },
  { text: "What's on your bucket list?", category: "future" },
  { text: "What dream have you been postponing?", category: "future" },
  { text: "What would you attempt if resources were unlimited?", category: "future" },
  { text: "What change do you want to see in the world?", category: "future" },
  { text: "What adventure do you want to have?", category: "future" },
  { text: "What kind of person do you want to become?", category: "future" },
  { text: "What's the next big milestone you're working toward?", category: "future" },
  { text: "What would make next month better than this one?", category: "future" },
  { text: "What new experience do you want to try?", category: "future" },

  // Relationships (15 questions)
  { text: "Who inspired you recently?", category: "relationships" },
  { text: "Who do you need to reconnect with?", category: "relationships" },
  { text: "What relationship in your life needs more attention?", category: "relationships" },
  { text: "Who has shaped who you are today?", category: "relationships" },
  { text: "What quality do you admire most in others?", category: "relationships" },
  { text: "Who would you like to thank?", category: "relationships" },
  { text: "What conversation do you need to have?", category: "relationships" },
  { text: "How did you show love to someone today?", category: "relationships" },
  { text: "Who makes you feel truly seen and heard?", category: "relationships" },
  { text: "What have you learned from a difficult relationship?", category: "relationships" },
  { text: "Who do you turn to in times of trouble?", category: "relationships" },
  { text: "What kind of friend do you want to be?", category: "relationships" },
  { text: "Who challenges you to be better?", category: "relationships" },
  { text: "What's the most meaningful conversation you've had recently?", category: "relationships" },
  { text: "How can you be more present with the people you love?", category: "relationships" },

  // Creativity (15 questions)
  { text: "What idea excited you today?", category: "creativity" },
  { text: "What creative project are you working on?", category: "creativity" },
  { text: "What would you create if you had no limits?", category: "creativity" },
  { text: "What inspires your creativity?", category: "creativity" },
  { text: "What problem would you love to solve?", category: "creativity" },
  { text: "What's a new way you could approach an old problem?", category: "creativity" },
  { text: "What art, music, or writing moved you recently?", category: "creativity" },
  { text: "What's something you'd like to make with your hands?", category: "creativity" },
  { text: "What hobby would you like to explore?", category: "creativity" },
  { text: "If you wrote a book, what would it be about?", category: "creativity" },
  { text: "What would you design if you were an architect?", category: "creativity" },
  { text: "What story do you want to tell?", category: "creativity" },
  { text: "What's the most creative thing you did today?", category: "creativity" },
  { text: "What would you invent to make life better?", category: "creativity" },
  { text: "How do you express yourself creatively?", category: "creativity" },

  // Challenge (15 questions)
  { text: "What scared you but you did anyway?", category: "challenge" },
  { text: "What's the hardest thing you're dealing with right now?", category: "challenge" },
  { text: "What obstacle are you currently facing?", category: "challenge" },
  { text: "What fear would you like to overcome?", category: "challenge" },
  { text: "What's outside your comfort zone that you want to try?", category: "challenge" },
  { text: "What failure taught you resilience?", category: "challenge" },
  { text: "What difficult conversation do you need to have?", category: "challenge" },
  { text: "What risk is worth taking?", category: "challenge" },
  { text: "What's the bravest thing you've done recently?", category: "challenge" },
  { text: "What challenge are you avoiding?", category: "challenge" },
  { text: "What would you do if you weren't afraid?", category: "challenge" },
  { text: "What setback have you overcome?", category: "challenge" },
  { text: "What tough decision are you facing?", category: "challenge" },
  { text: "What's pushing you to grow right now?", category: "challenge" },
  { text: "How do you handle stress and pressure?", category: "challenge" },
];

// Ensure we have at least 100 questions
if (QUESTIONS.length < 100) {
  console.warn(`Only ${QUESTIONS.length} questions defined, need at least 100`);
}
