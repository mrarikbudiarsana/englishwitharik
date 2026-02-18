
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ieltsContent = `<h1>Ready to reach your target <span style="color: #08507f;">IELTS band</span> and study or work abroad?</h1>
<p>At English with Arik, our IELTS Preparation Program is designed to match your level, goal, and schedule, with personal coaching, full materials, and guaranteed progress.</p>

<h2>Why Choose English with Arik?</h2>
<ul>
<li><strong>Tailored for You:</strong> Each program is adapted to your level and test goals, ensuring you focus on what matters most for your score.</li>
<li><strong>All-in-One Learning:</strong> Get access to live classes, recordings, and self-study materials all in one place via our Student Portal.</li>
<li><strong>Personalised Feedback:</strong> Receive detailed corrections on your Writing and Speaking tasks with score estimates and improvement strategies.</li>
<li><strong>Full Support:</strong> Enjoy WhatsApp mentoring between sessions, vocabulary lists, and comprehensive error analysis.</li>
</ul>

<h2>Pick the Class That Matches Your Needs</h2>
<h3>IELTS Full Preparation (All Skills)</h3>
<p>Complete package for Listening, Reading, Writing, and Speaking. Perfect for students targeting Band 6–7+ who want structured training.</p>
<h3>Skill-Focused Training (Specific Modules)</h3>
<p>Choose to focus on one or two skills — e.g. Writing & Speaking — with intensive drills and smart strategies to improve faster.</p>

<h2>Our Students Say</h2>
<blockquote>"I joined a private IELTS class with Mr. Arik for 24 hours of learning. Before that, my writing and speaking skills were below Band 6, but after taking this class, I gained a lot of insights. I've achieved the IELTS band score required by my university in Australia." — Bagas Falah Muhammad</blockquote>
<blockquote>"Five star obviously for Mas Arik. He teaches with patience, ensuring that I fully understand the material. I have a much better grasp on IELTS and its strategies, as he frequently provides practice exercises and reviews them with me." — Zati Adila Nurifa</blockquote>
<blockquote>"I took the IELTS General course with Mr. Arik and achieved a band score of 6.5. The course was very helpful and I would recommend it to anyone who wants to improve their English skills." — Budi Setiawan</blockquote>

<h2>Frequently Asked Questions</h2>
<p><strong>What is included in each IELTS program?</strong><br>Each program includes full class materials, recordings, personalised feedback, vocabulary lists, and optional test simulations. You'll also receive continuous support via WhatsApp throughout your course.</p>
<p><strong>Who is the Full Preparation course for?</strong><br>The Full Preparation course covers all four IELTS skills — Listening, Reading, Writing, and Speaking — and is ideal for students targeting Band 6–7+.</p>
<p><strong>What if I only want to focus on one skill?</strong><br>The Skill-Focused program concentrates on one or two areas (for example, Writing & Speaking) with intensive practice and strategy lessons.</p>
<p><strong>Is the Foundation Course right for me?</strong><br>Yes, if you are new to IELTS or need to build a solid base in grammar, vocabulary, and basic test strategies before progressing to full preparation.</p>
<p><strong>How do I know which level I am?</strong><br>You can book a free 30-minute trial. During this session, we'll discuss your goals, assess your English level, and help you choose the most suitable program.</p>
<p><strong>What English level do I need to start?</strong><br>We recommend at least a B1 (Intermediate) level for the best results, though our Foundation Course is perfect if you're slightly below that.</p>
<p><strong>How are the lessons conducted?</strong><br>All lessons are online, either privately or in small semi-private groups (2–3 students). Each session lasts 60 minutes, and all are interactive, practical, and fully guided by your instructor.</p>
<p><strong>Will I get feedback on my writing and speaking?</strong><br>Yes. Every writing and speaking task is reviewed personally with detailed notes, score estimates, and improvement strategies based on official band descriptors.</p>`;

const pteContent = `<h1>Ready to reach your target <span style="color: #08507f;">PTE score</span>?</h1>
<p>Unlock opportunities for study, work, or migration abroad. Our PTE Academic Program offers proven strategies, mock tests, and personalised feedback for real weekly progress.</p>

<h2>Why Choose English with Arik?</h2>
<ul>
<li><strong>Certified Trainer:</strong> Officially recognised by Pearson English Language Learning (Level 2 Professional), ensuring you get expert guidance.</li>
<li><strong>All-in-One Learning:</strong> Live interactive classes, full recordings, and structured self-study modules available on Google Classroom.</li>
<li><strong>Personalised Feedback:</strong> Detailed corrections and strategies for Writing, Speaking, and integrated-skill tasks to boost your performance.</li>
<li><strong>Full Support:</strong> WhatsApp mentoring, vocabulary guidance, and error analysis throughout your journey to success.</li>
</ul>

<h2>Choose Your Plan</h2>
<h3>Private Coaching (1-on-1 Focus)</h3>
<p>Intensive personal guidance tailored to your specific weaknesses. Flexible scheduling and maximum interaction. <strong>From Rp 1.200.000 (8 Hours)</strong></p>
<h3>Semi-Private Class (Small Group 2-3)</h3>
<p>Learn with friends or peers in a small group setting. Interactive and cost-effective while maintaining high quality. <strong>From Rp 720.000 (8 Hours)</strong></p>

<h2>Our Students Say</h2>
<blockquote>"I took private PTE Academic lessons with Mr Arik for a month before my test. His step-by-step guidance on speaking and writing templates helped me improve my confidence a lot. I especially liked the personalised feedback and mock test reviews. I achieved my target score for migration." — Nadia Ramadhani</blockquote>
<blockquote>"Mr Arik is an amazing trainer! Before joining his class, I struggled with the Reading and Listening parts. His detailed explanations and practice techniques made everything so much clearer. I love how he always encourages me and checks my progress through WhatsApp." — Andreas Saputra</blockquote>

<h2>Frequently Asked Questions</h2>
<p><strong>What makes the PTE Academic course different?</strong><br>Our PTE lessons combine expert human coaching and AI-powered mock tests. You’ll learn how to maximise scores in each task with feedback based on the real Pearson scoring system.</p>
<p><strong>Who is this course for?</strong><br>It’s designed for anyone preparing for study, work, or migration to English-speaking countries such as Australia, New Zealand, or Canada. Both first-time test takers and repeat candidates are welcome.</p>
<p><strong>Do I need to know my English level before joining?</strong><br>Not necessarily. You can take a quick free placement test or a PTE diagnostic test with us to determine your current score range and the right study plan.</p>
<p><strong>How long does it take to reach my target score?</strong><br>It depends on your starting level and goal. On average, students aiming for PTE 65+ (equivalent to IELTS 7.0) need at least 24 hours of structured lessons plus home practice.</p>
<p><strong>What’s included in the course package?</strong><br>Live 1-on-1 coaching, full digital study materials & recordings, AI mock tests (paid option), pronunciation drills, and personalised WhatsApp support.</p>`;


async function updatePages() {
    console.log('Updating IELTS page...');
    const { error: error1 } = await supabase
        .from('blog_pages')
        .update({ content: ieltsContent, updated_at: new Date().toISOString() })
        .eq('slug', 'ielts-preparation');

    if (error1) console.error('Error updating IELTS:', error1);
    else console.log('IELTS page updated.');

    console.log('Updating PTE page...');
    const { error: error2 } = await supabase
        .from('blog_pages')
        .update({ content: pteContent, updated_at: new Date().toISOString() })
        .eq('slug', 'pte-academic');

    if (error2) console.error('Error updating PTE:', error2);
    else console.log('PTE page updated.');
}

updatePages();
