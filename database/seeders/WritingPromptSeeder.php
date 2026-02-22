<?php

namespace Database\Seeders;

use App\Models\WritingPrompt;
use Illuminate\Database\Seeder;

class WritingPromptSeeder extends Seeder
{
    public function run(): void
    {
        $prompts = [
            // General
            [
                'title' => 'Describe your daily routine from morning to evening.',
                'body' => 'Write a detailed description of your typical day. Include what time you wake up, your morning habits, work or school activities, and how you spend your evenings. Try to use a variety of time expressions and daily activity vocabulary.',
                'category' => 'general',
                'difficulty' => 'beginner',
            ],
            [
                'title' => 'Write about your favorite food and why you like it.',
                'body' => 'Describe your favorite dish or meal. Where did you first try it? What ingredients does it contain? How does it taste and smell? Do you cook it yourself or eat it at a restaurant? Explain why it is special to you.',
                'category' => 'general',
                'difficulty' => 'beginner',
            ],
            [
                'title' => 'Describe a memorable travel experience and what you learned.',
                'body' => 'Think of a trip that left a lasting impression on you. Describe where you went, who you were with, and what you did. What challenges did you face? What cultural differences did you notice? What did you learn from the experience?',
                'category' => 'general',
                'difficulty' => 'intermediate',
            ],
            [
                'title' => 'Write about a person who has influenced your life.',
                'body' => 'Choose someone who has had a significant impact on your life. Describe who they are, how you know them, and what qualities make them special. Give specific examples of how they have influenced your decisions, values, or goals.',
                'category' => 'general',
                'difficulty' => 'intermediate',
            ],
            [
                'title' => 'Discuss the advantages and disadvantages of living in a big city.',
                'body' => 'Consider the many aspects of urban life: employment, culture, transportation, cost of living, environment, and social life. Present a balanced argument covering both the benefits and drawbacks. Use specific examples to support your points and conclude with your own opinion.',
                'category' => 'general',
                'difficulty' => 'advanced',
            ],

            // IELTS
            [
                'title' => 'Some people believe that children should begin studying foreign languages at primary school. To what extent do you agree or disagree?',
                'body' => 'This is an IELTS Task 2 opinion essay. You should write at least 250 words. Present a clear position, support it with reasons and examples, and address potential counterarguments. Structure your essay with an introduction, body paragraphs, and a conclusion.',
                'category' => 'ielts',
                'difficulty' => 'intermediate',
            ],
            [
                'title' => 'Many people prefer to shop online rather than in physical stores. Discuss the advantages and disadvantages.',
                'body' => 'This is an IELTS Task 2 discussion essay. Write at least 250 words. Discuss both the benefits and drawbacks of online shopping compared to traditional retail. Consider factors such as convenience, price, product quality, social interaction, and environmental impact.',
                'category' => 'ielts',
                'difficulty' => 'intermediate',
            ],
            [
                'title' => 'Some people think that governments should invest more in public transportation. Others believe the money should be spent on building new roads. Discuss both views and give your opinion.',
                'body' => 'This is an IELTS Task 2 discussion essay. Write at least 250 words. Explore arguments for both public transportation investment and road construction. Consider environmental, economic, and social factors. Provide your own well-reasoned opinion in the conclusion.',
                'category' => 'ielts',
                'difficulty' => 'advanced',
            ],
            [
                'title' => 'In many countries, the gap between the rich and the poor is widening. Discuss the causes and suggest solutions.',
                'body' => 'This is an IELTS Task 2 cause-solution essay. Write at least 250 words. Analyze the root causes of income inequality, such as education access, globalization, and technological change. Propose realistic solutions and explain how they would address the problem.',
                'category' => 'ielts',
                'difficulty' => 'advanced',
            ],
            [
                'title' => 'Some people believe that technology has made our lives more complicated rather than easier. To what extent do you agree or disagree?',
                'body' => 'This is an IELTS Task 2 opinion essay. Write at least 250 words. Consider how technology affects daily life, work, relationships, and mental health. Present a clear thesis and support it with specific examples from modern life.',
                'category' => 'ielts',
                'difficulty' => 'intermediate',
            ],

            // TOEFL
            [
                'title' => 'Do you agree or disagree: It is better to have a broad knowledge of many subjects than to specialize in one.',
                'body' => 'This is a TOEFL Independent Writing task. Write a clear response stating your position. Use specific reasons and examples from your personal experience, observations, or reading to support your argument. Aim for 300-350 words.',
                'category' => 'toefl',
                'difficulty' => 'intermediate',
            ],
            [
                'title' => 'Do you agree or disagree: Students should be required to take physical education courses in college.',
                'body' => 'This is a TOEFL Independent Writing task. Take a clear position and defend it with concrete examples. Consider the benefits of physical activity, academic workload, personal freedom, and the purpose of higher education.',
                'category' => 'toefl',
                'difficulty' => 'intermediate',
            ],
            [
                'title' => 'Some people prefer to work for a large company, while others prefer to work for a small company. Which do you prefer and why?',
                'body' => 'This is a TOEFL Independent Writing task. State your preference clearly and explain your reasoning. Compare aspects such as career growth, work environment, job stability, learning opportunities, and work-life balance.',
                'category' => 'toefl',
                'difficulty' => 'advanced',
            ],
            [
                'title' => 'Do you agree or disagree: Technology has made it easier for people to connect, but harder to form deep relationships.',
                'body' => 'This is a TOEFL Independent Writing task. Develop a nuanced argument about the impact of technology on human relationships. Use examples from social media, messaging apps, video calls, and face-to-face interactions to support your position.',
                'category' => 'toefl',
                'difficulty' => 'advanced',
            ],
            [
                'title' => 'Do you agree or disagree: It is better to study alone than to study in a group.',
                'body' => 'This is a TOEFL Independent Writing task. Choose your position and explain why. Think about focus, motivation, different learning styles, and the ability to discuss and clarify ideas. Use examples from your own experience.',
                'category' => 'toefl',
                'difficulty' => 'beginner',
            ],

            // Business
            [
                'title' => 'Write an email to a colleague requesting a meeting to discuss a new project.',
                'body' => 'Write a professional email that includes a clear subject line, greeting, purpose of the meeting, proposed times, and any preparation needed. Keep the tone friendly but professional. Aim for 100-150 words.',
                'category' => 'business',
                'difficulty' => 'beginner',
            ],
            [
                'title' => 'Write a short message introducing yourself to a new team.',
                'body' => 'Compose a brief professional introduction for a team chat or email. Include your name, role, background, and what you are looking forward to. Keep it warm and approachable while maintaining professionalism. Aim for 80-120 words.',
                'category' => 'business',
                'difficulty' => 'beginner',
            ],
            [
                'title' => 'Draft a response to a client complaint about a delayed shipment.',
                'body' => 'Write a professional email responding to an unhappy client. Acknowledge the problem, apologize sincerely, explain what happened without making excuses, describe the steps being taken to resolve the issue, and offer compensation if appropriate. Maintain a courteous and solution-oriented tone.',
                'category' => 'business',
                'difficulty' => 'intermediate',
            ],
            [
                'title' => 'Write a proposal email suggesting a new process to improve team efficiency.',
                'body' => 'Draft an email to your manager proposing a change in workflow. Clearly state the current problem, your proposed solution, expected benefits, implementation steps, and any resources needed. Use persuasive but professional language.',
                'category' => 'business',
                'difficulty' => 'intermediate',
            ],
            [
                'title' => 'Write a formal email to senior management recommending a change in company policy, with supporting evidence.',
                'body' => 'Compose a formal business email recommending a specific policy change. Include an executive summary, background context, data or evidence supporting the change, potential risks and mitigation strategies, and a clear call to action. Use formal register and structured paragraphs.',
                'category' => 'business',
                'difficulty' => 'advanced',
            ],
        ];

        foreach ($prompts as $prompt) {
            WritingPrompt::firstOrCreate(['title' => $prompt['title']], $prompt);
        }
    }
}
