import { supabase } from '../lib/supabaseClient';

export const subjects = ['Economics', 'English', 'Government', 'CRK'];
export const years = [2022, 2023, 2024, 2025];

export async function fetchQuestions(subject, year) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('id, question, option_a, option_b, option_c, option_d, answer, explanation')
      .eq('subject', subject)
      .eq('year', parseInt(year, 10))
      .order('id', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((q) => ({
      id: q.id,
      question: q.question,
      options: [
        { label: 'A', text: q.option_a },
        { label: 'B', text: q.option_b },
        { label: 'C', text: q.option_c },
        { label: 'D', text: q.option_d }
      ],
      answer: q.answer,
      explanation: q.explanation
    }));
  } catch (err) {
    console.error('Error fetching questions:', err);
    return [];
  }
}