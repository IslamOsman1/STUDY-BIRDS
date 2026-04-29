import { MapPin, Quote, Star } from "lucide-react";
import type { Testimonial } from "../../types";
import { getStudentPhoto } from "../../utils/marketingVisuals";

export const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const rating = testimonial.rating || 5;

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={getStudentPhoto(testimonial.studentName)}
            alt={testimonial.studentName}
            loading="lazy"
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div>
            <p className="font-semibold text-slate-900">{testimonial.studentName}</p>
            {testimonial.destination ? (
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
                <MapPin size={14} />
                {testimonial.destination}
              </p>
            ) : null}
          </div>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Quote size={18} />
        </span>
      </div>

      <div className="mt-5 flex gap-1 text-amber-400" aria-label={`${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={16} fill="currentColor" className={index < rating ? "" : "opacity-25"} />
        ))}
      </div>

      <p className="mt-4 text-lg leading-8 text-slate-700">"{testimonial.quote}"</p>
    </div>
  );
};
