import { supabase } from '../src/lib/supabase.js';

async function verifyQAPageSchema(slug) {
    console.log(`--- Verifying QAPage Schema for: ${slug} ---`);
    
    const { data: question, error: qError } = await supabase
        .from('community_questions')
        .select('*')
        .eq('slug', slug)
        .single();

    if (qError || !question) {
        console.error('Question not found');
        return;
    }

    const { data: answers, error: aError } = await supabase
        .from('community_answers')
        .select('*, clinical_profiles(*)')
        .eq('question_id', question.id)
        .eq('status', 'published');

    if (aError) {
        console.error('Error fetching answers');
        return;
    }

    const expertAnswer = answers.find(a => a.is_expert_answer) || answers.find(a => a.is_best_answer);
    const clinician = expertAnswer?.clinical_profiles;

    if (!expertAnswer) {
        console.warn('NO EXPERT ANSWER FOUND for this question.');
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "QAPage",
        "name": question.seo_title || question.title,
        "mainEntity": {
            "@type": "Question",
            "name": question.title,
            "acceptedAnswer": expertAnswer ? {
                "@type": "Answer",
                "text": expertAnswer.content.replace(/<[^>]*>/g, ''),
                "author": {
                    "@type": "Person",
                    "name": clinician ? clinician.full_name : (expertAnswer.display_name || 'Community Member'),
                    "jobTitle": clinician?.credentials || "Clinician"
                }
            } : null
        }
    };

    console.log('Generated Schema:');
    console.log(JSON.stringify(schema, null, 2));

    // Validations
    const errors = [];
    if (!schema.name) errors.push('Missing schema name (title)');
    if (expertAnswer && !schema.mainEntity.acceptedAnswer) errors.push('Expert answer exists but not mapped in schema');
    if (expertAnswer && !clinician) errors.push('E-E-A-T Warning: Expert answer is not linked to a clinical profile');
    if (expertAnswer && schema.mainEntity.acceptedAnswer.text.includes('<')) errors.push('HTML tags detected in acceptedAnswer.text');

    if (errors.length > 0) {
        console.error('VALIDATION FAILED:');
        errors.forEach(e => console.error(` - ${e}`));
    } else {
        console.log('SCHEMA VALIDATION PASSED');
    }
}

// Example usage: node scripts/test-community-schema.mjs va-disability-rating-arm-numbness-tingling-cervical-radiculopathy
const slug = process.argv[2];
if (slug) {
    verifyQAPageSchema(slug);
} else {
    console.log('Please provide a slug');
}
