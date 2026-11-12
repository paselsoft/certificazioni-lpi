// Elenco degli esami e delle domande. Ogni esame ha il suo file di dati (data/exam-<codice>.js)
// che si aggiunge qui con EXAMS.push, e le sue domande in questions/<codice>/ (un file per
// argomento) che si aggiungono con addQuestions: Linux Essentials 1.6 (010-160) oggi, la 2.0
// (010-200) e LPIC-1 in seguito, senza toccare il resto dell'app.
const EXAMS = [];
const QUESTIONS = [];

// Domande di un esame. L'obiettivo è la parte dell'id prima del trattino ("2.1-03" → 2.1).
function addQuestions(examId, list) {
    list.forEach(question => QUESTIONS.push(Object.assign({ exam: examId, objective: question.id.split("-")[0] }, question)));
}
