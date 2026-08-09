export type TestimonialTag = 'ielts' | 'toefl-ibt' | 'pte' | 'general-english'

export type Testimonial = {
  name: string
  role: string
  quote: string
  program: string
  tags: TestimonialTag[]
}

/**
 * Shared student testimonials. Surfaced on the home page and filtered by tag on
 * each program page via `getTestimonials()`.
 */
export const testimonials: Testimonial[] = [
  {
    name: 'Maria Sari',
    role: 'Civil Servant, Jakarta',
    quote: 'The practice platform is really great and makes preparing for TOEFL iBT so much easier. Kak Arik is also an amazing teacher—he explains everything clearly and makes things easy to understand.',
    program: 'TOEFL iBT Group & Private',
    tags: ['toefl-ibt'],
  },
  {
    name: 'Serli Yunita',
    role: 'Student, Alice Springs',
    quote: 'Highly recommend! The explanations were clear, the strategies were really useful, and I felt supported throughout my PTE Academic preparation. I managed to achieve my desired score for my Australian visa application. Really grateful for all the guidance and support!',
    program: 'PTE Academic Private',
    tags: ['pte'],
  },
  {
    name: 'Choirina Fidaroini',
    role: 'Civil Servant, Jakarta',
    quote: 'The mentor was very professional, and I really liked that the lessons could be tailored to what we needed. I was able to improve my IELTS Speaking score from 5.5 to 7.0, which was a great achievement for me. The vocabulary lists were also really useful, especially on the actual IELTS test day.',
    program: 'IELTS Semi-Private',
    tags: ['ielts'],
  },
  {
    name: 'Dian Rahmawati',
    role: 'Civil Servant, Jakarta',
    quote: 'I’m really grateful to have learned IELTS with Kak Arik. He always encouraged me to go above and beyond and helped me believe in my potential. I especially improved a lot in Writing thanks to his practical tips and effective strategies. His personalized feedback was very helpful and never felt judgmental, which made the learning process comfortable and motivating. The modules he provided were also comprehensive yet easy to understand.',
    program: 'IELTS Academic Semi-Private',
    tags: ['ielts'],
  },
  {
    name: 'Sahari',
    role: 'Manager, Jakarta',
    quote: 'I was very happy with the final result—I achieved a score of 5.0, equivalent to CEFR C1. Just a few months earlier, I was still at B2 level and struggling particularly with Writing and Speaking. Having a tutor at English with Arik made me feel much more confident about my performance and progress. The feedback, tips, and strategies were also extremely helpful in understanding what I needed to do to meet the TOEFL iBT scoring criteria.',
    program: 'TOEFL iBT Group & Private',
    tags: ['toefl-ibt'],
  },
  {
    name: 'Ni Putu Ariessa',
    role: 'Engineer, Jakarta',
    quote: 'Mr. Arik is such a fun and supportive teacher! I had an amazing experience preparing for my TOEFL iBT test. I didn’t expect much at first since it’s also my first time taking an online class, but he managed to find a way to make the class enjoyable and interactive. He also provides a strategic plan for each section and now I’m much more confident for my upcoming test 🤠',
    program: 'TOEFL iBT Group',
    tags: ['toefl-ibt'],
  },
  {
    name: 'Ikrom Mustofa',
    role: 'Lecturer, Yogyakarta',
    quote: 'I took an IELTS course with Mas Arik over the past few months, and it was a great learning experience. He explained the IELTS test comprehensively and provided practical tips and strategies that helped me better understand each section of the exam. What I appreciated most was the private class format, which allowed the lessons to be tailored to my current ability and target IELTS score. This made the learning process much more effective and focused.',
    program: 'IELTS Academic Private',
    tags: ['ielts'],
  },
  {
    name: 'Muhammad Ramdani',
    role: 'Digital Marketer, Bogor',
    quote: 'Mr. Arik explained every section of the PTE Academic test in great detail, from Speaking and Writing to Reading and Listening. The tips and strategies he shared were also very helpful and made it easier for me to answer the questions more quickly and confidently.',
    program: 'PTE Academic Private',
    tags: ['pte'],
  },
  {
    name: 'Fauziannisa',
    role: 'Writer, Jakarta',
    quote: 'I really enjoyed learning with Mr. Arik during the 8-hour TOEFL iBT course. He explains the material clearly and provides useful strategies, especially for the writing and speaking sections. His feedback is detailed and encouraging, which has helped me become more confident for the test. He also included interactive games during the lessons, which made the class fun.',
    program: 'TOEFL iBT Private',
    tags: ['toefl-ibt'],
  },
  {
    name: 'Muhammad Affan',
    role: 'Civil Servant, Jakarta',
    quote: 'I had a great experience preparing for the IELTS test with Mr. Arik. He is patient, knowledgeable, and supportive throughout the learning process. His feedback was very helpful in identifying my weaknesses and improving my performance. The lessons were well-structured, practical, and focused on real IELTS exam requirements.',
    program: 'IELTS Academic Private',
    tags: ['ielts'],
  },
  {
    name: 'Irdha Maulina',
    role: 'Student, Malang',
    quote: 'Mr. Arik taught me about TOEFL iBT, which was very insightful and impactful. The most interesting thing is that he gave us a comprehensive platform where we can do pre- and post-tests, plus many good features to track our comprehension!',
    program: 'TOEFL iBT',
    tags: ['toefl-ibt'],
  },
  {
    name: 'Stefanie Yunita',
    role: 'Casual Worker, South Australia',
    quote: 'Ka Arik is very patient and easy to understand when explaining tips and tricks for PTE. He helped me to improve my score and boosted my confidence. Thank you so much for your support and guidance!',
    program: 'PTE Academic Private',
    tags: ['pte'],
  },
  {
    name: 'Eka Saputra',
    role: 'Bartender, Jembrana',
    quote: 'I am very satisfied with my learning experience here. The material is explained clearly and is easy to understand. I have learned many new things here, and it has helped me improve a lot. Thank you so much Mr Arik 🙏🏽😊',
    program: 'General English',
    tags: ['general-english'],
  },
  {
    name: 'Reza Aris',
    role: 'Civil Servant, Jakarta',
    quote: 'IELTS preparation with Sir Arik, especially the speaking program, greatly helped me build my confidence for the exam. He truly understands the common challenges students face and provides practical tips to overcome them effectively.',
    program: 'IELTS Academic Semi-Private',
    tags: ['ielts'],
  },
  {
    name: 'Kiki Widya Sari',
    role: 'Student, South Sumatera',
    quote: 'Big thanks to Mr. Arik for helping me prepare for my PTE! I managed to get an overall score of 68, and his teaching really made a difference. His explanations are super easy to understand, and it really helped me during the real test. I especially liked the tips and tricks for writing—they were very useful. Whenever I got confused about grammar, he explained it clearly right away. Super recommended for those who want to start their PTE journey!',
    program: 'PTE Academic Private',
    tags: ['pte'],
  },
  {
    name: 'Ary',
    role: 'English Teacher, Denpasar',
    quote: 'Great teacher and learning experience. I took an 8-hour IELTS intensive class. During the session, Mr. Arik was very detailed in checking my writing and speaking. Besides, he also provided very comprehensive information about each topic discussion. Highly recommended.',
    program: 'IELTS Academic Private',
    tags: ['ielts'],
  },
  {
    name: 'Intan Ramayanti',
    role: 'Hospitality Worker, Kintamani',
    quote: 'It was such a great experience learning with Mr. Arik. Thank you for everything, Mr. Arik! And now, I’ve finally made it to Europe! ☺️🙏',
    program: 'General English Semi-Private',
    tags: ['general-english'],
  },
]

/** Testimonials matching any of the given tags, in source order. */
export const getTestimonials = (...tags: TestimonialTag[]): Testimonial[] =>
  testimonials.filter((t) => t.tags.some((tag) => tags.includes(tag)))
