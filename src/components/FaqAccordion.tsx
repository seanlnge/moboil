import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "~/components/ui/accordion";

const faqItems = [
	{
		value: "item-1",
		question: "What is included in the $87 price?",
		answer:
			"Our flat rate includes up to 5 quarts of conventional or synthetic blend oil, a new premium oil filter, labor, and our travel fee. There are no hidden charges.",
	},
	{
		value: "item-2",
		question: "Where do you provide service?",
		answer:
			"We serve the greater Tampa area. We can perform the oil change at your home, office, campus, or any legal parking spot.",
	},
	{
		value: "item-3",
		question: "How long does the service take?",
		answer:
			"Most appointments are completed in under 60 minutes from the time we arrive.",
	},
	{
		value: "item-4",
		question: "Do I need to be present?",
		answer:
			"We just need access to your vehicle (keys) to pop the hood and verify the work. You can hand us the keys and go back to what you were doing!",
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
