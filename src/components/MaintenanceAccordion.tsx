import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "~/components/ui/accordion";

export function MaintenanceAccordion() {
	return (
		<Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3"]} className="w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger className="text-xl md:text-2xl font-header font-bold text-m-primary-black hover:no-underline">
					Why are oil changes important?
				</AccordionTrigger>
				<AccordionContent className="text-base">
					<p className="text-slate-600 leading-relaxed">
						Oil is the lifeblood of your engine. It lubricates moving parts, reduces friction, and helps regulate engine temperature. Over time, oil breaks down and collects dirt and debris, which can lead to increased wear and tear, reduced fuel efficiency, and eventually, engine failure. Regular oil changes ensure your engine stays clean, protected, and performing at its best.
					</p>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-2">
				<AccordionTrigger className="text-xl md:text-2xl font-header font-bold text-m-primary-black hover:no-underline">
					When should you change your oil?
				</AccordionTrigger>
				<AccordionContent className="text-base">
					<p className="text-slate-600 leading-relaxed mb-4">
						The frequency of oil changes depends on your vehicle's make, model, year, and driving conditions.
					</p>
					<ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
						<li><strong>Standard Oil:</strong> Typically every 3,000 to 5,000 miles.</li>
						<li><strong>Synthetic Blend:</strong> Usually every 5,000 to 7,500 miles.</li>
						<li><strong>Full Synthetic:</strong> Can last 7,500 to 10,000 miles or more.</li>
					</ul>
					<p className="text-slate-600 leading-relaxed mt-4">
						Always consult your owner's manual for the manufacturer's specific recommendations. If you drive in severe conditions (stop-and-go traffic, extreme heat, towing), you may need to change it more frequently.
					</p>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-3" className="border-b-0">
				<AccordionTrigger className="text-xl md:text-2xl font-header font-bold text-m-primary-black hover:no-underline">
					Signs you need an oil change
				</AccordionTrigger>
				<AccordionContent className="text-base">
					<ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
						<li><strong>Check Engine or Oil Change Light:</strong> The most obvious warning sign.</li>
						<li><strong>Dark, Dirty Oil:</strong> Fresh oil is amber; dirty oil is dark brown or black.</li>
						<li><strong>Engine Noise:</strong> Knocking or ticking sounds can indicate poor lubrication.</li>
						<li><strong>Exhaust Smoke:</strong> Blue or gray smoke can signal an oil leak or burning oil.</li>
						<li><strong>Oil Smell:</strong> A strong smell of oil inside the car could mean a leak.</li>
					</ul>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
