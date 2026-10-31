import { useState } from "react";
import Modal from "../common/Modal";

const recipient = "malaw596@gmail.com";

export default function FeedbackModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};

    if (!email.trim())
      nextErrors.email = "Votre adresse e-mail est obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      nextErrors.email = "Saisissez une adresse e-mail valide.";

    if (!message.trim())
      nextErrors.message = "Votre avis ne peut pas être vide.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const subject = "Nouvel avis client — LAWPIKING";
    const body = `Adresse e-mail du visiteur : ${email.trim()}\n\nAvis :\n${message.trim()}`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <Modal title="Donnez votre avis sur LAWPIKING" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-8">
        <p className="text-sm leading-6 text-gray-600">
           💬 Votre avis compte ! Partagez votre expérience avec LAWPIKING.
        </p>
        <label className="block text-sm font-medium text-gray-700">
          Adresse e-mail <span className="text-law-red">*</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Votre adresse e-mail"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "feedback-email-error" : undefined}
            className={`mt-1.5 w-full rounded-lg border px-3 py-3 text-base outline-none transition focus:border-law-red focus:ring-2 focus:ring-red-100 ${errors.email ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.email && (
            <span
              id="feedback-email-error"
              className="mt-1.5 block text-sm text-red-700"
            >
              {errors.email}
            </span>
          )}
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Votre message <span className="text-law-red">*</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Écrivez votre avis ici..."
            rows={6}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? "feedback-message-error" : undefined
            }
            className={`mt-1.5 w-full resize-y rounded-lg border px-3 py-3 text-base outline-none transition focus:border-law-red focus:ring-2 focus:ring-red-100 ${errors.message ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.message && (
            <span
              id="feedback-message-error"
              className="mt-1.5 block text-sm text-red-700"
            >
              {errors.message}
            </span>
          )}
        </label>
        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-law-red px-5 py-3 font-bold text-white transition hover:bg-law-red-dark"
          >
            Envoyer mon avis
          </button>
        </div>
      </form>
    </Modal>
  );
}
