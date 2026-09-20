import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { eligibleItems, generateQuiz } from '../../data/quiz/engine';
import type { QuizItem, Question } from '../../data/quiz/engine';
import { rankCountries } from '../../data/ranks/model';
import './quiz.css';
interface Props {
  items: QuizItem[];
  mode: 'ranks' | 'symbols';
  initialCountry?: string;
  initialCategory?: string;
  categories?: Record<string, string>;
  onClose: () => void;
}
export default function Quiz({
  items,
  mode,
  initialCountry = 'all',
  initialCategory = 'all',
  categories = {},
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [country, setCountry] = useState(initialCountry);
  const [service, setService] = useState('all');
  const [category, setCategory] = useState(initialCategory);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    const el = dialog.current,
      trigger = document.activeElement;
    el?.showModal();
    return () => {
      el?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (started) heading.current?.focus();
  }, [step, started]);
  const scoped = items.filter((i) =>
    mode === 'ranks'
      ? (country === 'all' || i.country === country) &&
        (service === 'all' || i.service === service)
      : category === 'all' || i.category === category,
  );
  const available = eligibleItems(scoped).length;
  const q = questions[step];
  const finished = started && step >= questions.length;
  const answer = answers[step];
  const score = questions.reduce(
    (n, q, i) => n + Number(answers[i] === q.item.id),
    0,
  );
  function start() {
    setQuestions(generateQuiz(scoped));
    setAnswers([]);
    setStep(0);
    setStarted(true);
    setImageFailed(false);
  }
  function select(id: string) {
    if (answer) return;
    setAnswers((a) => [...a, id]);
  }
  return (
    <dialog
      ref={dialog}
      className="study-dialog"
      onCancel={onClose}
      aria-labelledby="quiz-title"
    >
      <header className="study-header">
        <span className="field-kicker">
          PRACTICE / {mode === 'ranks' ? 'RANKS & INSIGNIA' : 'NATO SYMBOLS'}
        </span>
        <button
          className="study-close"
          onClick={onClose}
          aria-label="Close quiz"
        >
          <X size={20} />
        </button>
      </header>
      {!started ? (
        <div className="quiz-setup">
          <span className="study-number">
            A LITTLE PRACTICE GOES A LONG WAY
          </span>
          <h2 id="quiz-title">Put your eye to the test.</h2>
          <p>
            Identify the image. Decode the description. Six choices, with a
            short explanation after every answer.
          </p>
          <div className="quiz-scope">
            {mode === 'ranks' ? (
              <>
                <label>
                  Country / collection
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="all">All countries & NCC</option>
                    {Object.entries(rankCountries).map(([id, c]) => (
                      <option key={id} value={id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Service / wing
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="all">All services / wings</option>
                    <option value="navy">Navy / Naval wing</option>
                    <option value="army">Army / Army wing</option>
                    <option value="air">Air Force / Air wing</option>
                  </select>
                </label>
              </>
            ) : (
              <label>
                Study topic
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All topics</option>
                  {Object.entries(categories).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="quiz-start">
            <span>
              {available
                ? `${Math.min(10, available)} questions · untimed`
                : 'This selection needs at least six distinct answers.'}
            </span>
            <button
              className="study-primary"
              disabled={!available}
              onClick={start}
            >
              Start quiz <ArrowRight size={17} />
            </button>
          </div>
          <p className="quiz-small">
            Questions are generated from the reference collection.{' '}
            {mode === 'ranks'
              ? 'Every question identifies its country, service and category. Unverified insignia are tested using descriptions only.'
              : 'This practice uses the library’s standard examples; builder settings do not change the quiz.'}
          </p>
        </div>
      ) : finished ? (
        <div className="quiz-results">
          <span className="study-number">SESSION COMPLETE</span>
          <h2 id="quiz-title" ref={heading} tabIndex={-1}>
            {score}
            <span> / {questions.length}</span>
          </h2>
          <p>
            {score === questions.length
              ? 'Every detail, recognized.'
              : 'Keep building your recognition.'}
          </p>
          <div className="quiz-review">
            {questions.map((question, i) => (
              <details key={question.item.id}>
                <summary>
                  <span
                    className={
                      answers[i] === question.item.id ? 'correct' : 'incorrect'
                    }
                  >
                    {answers[i] === question.item.id ? (
                      <Check size={16} />
                    ) : (
                      <X size={16} />
                    )}
                  </span>
                  {question.item.name}
                  <small>{question.item.context}</small>
                </summary>
                <p>{question.item.description}</p>
                <p>
                  Your answer:{' '}
                  {question.options.find((o) => o.id === answers[i])?.name}
                </p>
                <a href={question.item.link}>Open reference →</a>
              </details>
            ))}
          </div>
          <div className="quiz-actions">
            <button onClick={() => setStarted(false)}>Change scope</button>
            <button className="study-primary" onClick={start}>
              <RotateCcw size={16} /> Try another round
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-question">
          <div className="quiz-progress">
            <span>
              QUESTION {String(step + 1).padStart(2, '0')} / {questions.length}
            </span>
            <span>{score} correct</span>
          </div>
          <progress
            value={step + 1}
            max={questions.length}
            aria-label="Quiz progress"
          />
          <span className="quiz-context">{q.item.context}</span>
          <h2 id="quiz-title" ref={heading} tabIndex={-1}>
            {q.kind === 'image' && !imageFailed
              ? 'What does this represent?'
              : 'Which entry fits this description?'}
          </h2>
          {q.kind === 'image' && !imageFailed ? (
            <div className="quiz-image">
              <img
                src={q.item.image}
                alt="Insignia or symbol to identify"
                onError={() => setImageFailed(true)}
              />
            </div>
          ) : (
            <blockquote className="quiz-description">
              {q.item.description}
            </blockquote>
          )}
          <div className="quiz-options" aria-label="Answer choices">
            {q.options.map((o, i) => (
              <button
                key={o.id}
                onClick={() => select(o.id)}
                disabled={!!answer}
                className={
                  answer
                    ? o.id === q.item.id
                      ? 'is-correct'
                      : o.id === answer
                        ? 'is-incorrect'
                        : ''
                    : ''
                }
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {o.name}
                {answer && o.id === q.item.id && <Check size={17} />}
              </button>
            ))}
          </div>
          {answer && (
            <div className="quiz-feedback" role="status">
              <strong>
                {answer === q.item.id
                  ? 'Correct.'
                  : `The answer is ${q.item.name}.`}
              </strong>
              <p>{q.item.description}</p>
              <button
                className="study-primary"
                onClick={() => {
                  setImageFailed(false);
                  setStep((s) => s + 1);
                }}
              >
                {step === questions.length - 1
                  ? 'See results'
                  : 'Next question'}{' '}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
