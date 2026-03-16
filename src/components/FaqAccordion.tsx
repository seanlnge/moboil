import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "~/components/ui/accordion";

const faqItems = [
	{
		value: "item-1",
		question: "Do I need to be there the whole time?",
		answer:
			"No. As long as we can access your vehicle and keys, you can go back to class, work, or whatever else you are doing.",
	},
	{
		value: "item-2",
		question: "Can you service my car at my apartment or house?",
		answer:
			"Yes. We are built for Gainesville homes, townhomes, and student apartment lots with accessible outdoor parking.",
	},
	{
		value: "item-3",
		question: "How long does the service take?",
		answer:
			"Most appointments are completed in under 60 minutes from the time we arrive.",
	},
	{
		value: "item-4",
		question: "What is included in the $97 flat rate?",
		answer:
			"Full-synthetic oil, a new oil filter, labor, and mobile service to your location. No hidden fees and no surprise upsells.",
	},
	{
		value: "item-5",
		question: "Do you only work in Gainesville?",
		answer:
			"Right now, Gainesville is our primary service area. If you are nearby, reach out and we can confirm availability.",
	},
	{
		value: "item-6",
		question: "Is mobile oil service safe and clean?",
		answer:
			"Yes. We use professional procedures, keep the job site tidy, and dispose of used oil responsibly. Moboil is fully insured.",
	},
	{
		value: "item-7",
		question: "What if I have never booked an oil change before?",
		answer:
			"That is exactly why we keep it simple. Book your time, tell us your car details, and we handle the rest with clear communication the whole way.",
	},
] as const;

export function FaqAccordion() {
	return (
		<Accordion type="single" collapsible className="w-full">
			{faqItems.map((item) => (
				<AccordionItem key={item.value} value={item.value} className="border-white/10">
					<AccordionTrigger className="text-lg hover:no-underline hover:text-orange-400 text-slate-200">
						{item.question}
					</AccordionTrigger>
					<AccordionContent className="text-slate-400 text-base leading-relaxed">
						{item.answer}
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
