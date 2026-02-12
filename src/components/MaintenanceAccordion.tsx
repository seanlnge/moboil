import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "~/components/ui/accordion";

export function MaintenanceAccordion() {
	return (
		<Accordion type="multiple" defaultValue={["item-1"]} className="w-full">
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
						<li><strong>Conventional Oil:</strong> Typically every 3,000 to 5,000 miles.</li>
						<li><strong>Synthetic Blend:</strong> Usually every 5,000 to 7,500 miles.</li>
						<li><strong>Full Synthetic:</strong> Can last 7,500 to 10,000 miles or more.</li>
					</ul>
					<p className="text-slate-600 leading-relaxed mt-4">
						Always consult your owner's manual for the manufacturer's specific recommendations. If you drive in severe conditions — stop-and-go traffic, extreme heat (common in Tampa), short trips, or towing — you may need to change it more frequently.
					</p>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-3">
				<AccordionTrigger className="text-xl md:text-2xl font-header font-bold text-m-primary-black hover:no-underline">
					Signs you need an oil change
				</AccordionTrigger>
				<AccordionContent className="text-base">
					<ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
						<li><strong>Check Engine or Oil Change Light:</strong> The most obvious warning sign from your dashboard.</li>
						<li><strong>Dark, Dirty Oil:</strong> Fresh oil is amber and translucent; if yours is dark brown or black, it's time.</li>
						<li><strong>Engine Noise:</strong> Knocking or ticking sounds can indicate poor lubrication.</li>
						<li><strong>Exhaust Smoke:</strong> Blue or gray smoke from the tailpipe can signal burning oil.</li>
						<li><strong>Oil Smell Inside the Car:</strong> A strong oil odor in the cabin could mean a leak.</li>
						<li><strong>Sluggish Performance:</strong> Old oil causes more friction, making your engine work harder and feel less responsive.</li>
					</ul>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-4">
				<AccordionTrigger className="text-xl md:text-2xl font-header font-bold text-m-primary-black hover:no-underline">
					Why full synthetic oil?
				</AccordionTrigger>
				<AccordionContent className="text-base">
					<p className="text-slate-600 leading-relaxed mb-4">
						At Moboil, we use full-synthetic oil for every oil change. Here's why it matters:
					</p>
					<ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
						<li><strong>Better Heat Resistance:</strong> Synthetic oil handles high temperatures far better than conventional oil — especially important in Florida's heat.</li>
						<li><strong>Longer Lasting:</strong> It breaks down more slowly, meaning you can go longer between changes without sacrificing protection.</li>
						<li><strong>Cleaner Engine:</strong> Synthetic oil produces fewer deposits and sludge, keeping your engine internals cleaner over time.</li>
						<li><strong>Improved Fuel Economy:</strong> Less friction means your engine runs more efficiently, saving you money at the pump.</li>
						<li><strong>Cold-Start Protection:</strong> It flows better at low temperatures, protecting your engine from the moment you start it.</li>
					</ul>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-5">
				<AccordionTrigger className="text-xl md:text-2xl font-header font-bold text-m-primary-black hover:no-underline">
					Other routine maintenance to keep in mind
				</AccordionTrigger>
				<AccordionContent className="text-base">
					<p className="text-slate-600 leading-relaxed mb-4">
						Oil changes are a cornerstone of vehicle care, but don't overlook these other essentials:
					</p>
					<ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
						<li><strong>Tire Pressure:</strong> Check monthly. Under-inflated tires wear faster and hurt fuel economy. Florida heat causes pressure to fluctuate more than you'd expect.</li>
						<li><strong>Air Filter:</strong> Replace every 15,000–30,000 miles. A clogged filter restricts airflow and reduces engine performance.</li>
						<li><strong>Coolant:</strong> Especially critical in hot climates. Have your coolant level and condition checked regularly to prevent overheating.</li>
						<li><strong>Brake Pads:</strong> Listen for squealing or grinding. Most pads last 30,000–70,000 miles depending on driving habits.</li>
						<li><strong>Windshield Wipers:</strong> Florida's afternoon rain is relentless. Replace wipers every 6–12 months for clear visibility.</li>
						<li><strong>Battery:</strong> Heat accelerates battery degradation. Have it tested annually, especially if it's over 3 years old.</li>
					</ul>
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value="item-6" className="border-b-0">
				<AccordionTrigger className="text-xl md:text-2xl font-header font-bold text-m-primary-black hover:no-underline">
					What happens if you skip oil changes?
				</AccordionTrigger>
				<AccordionContent className="text-base">
					<p className="text-slate-600 leading-relaxed mb-4">
						Putting off oil changes might seem harmless, but the consequences compound quickly:
					</p>
					<ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
						<li><strong>Sludge Buildup:</strong> Old oil thickens into sludge that clogs passages and starves components of lubrication.</li>
						<li><strong>Accelerated Wear:</strong> Metal-on-metal contact from degraded oil leads to premature wear on bearings, pistons, and camshafts.</li>
						<li><strong>Overheating:</strong> Dirty oil is less effective at absorbing and transferring heat away from the engine.</li>
						<li><strong>Voided Warranty:</strong> Many manufacturers require proof of regular oil changes to honor powertrain warranties.</li>
						<li><strong>Costly Repairs:</strong> An $87 oil change is far cheaper than a $4,000–$8,000 engine replacement.</li>
					</ul>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
