import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

interface SizeGuideProps {
  category: string;
  children?: React.ReactNode;
}

const CLOTHING_SIZES = [
  { size: "S", chest: "86-91", waist: "71-76", hips: "86-91" },
  { size: "M", chest: "96-101", waist: "81-86", hips: "96-101" },
  { size: "L", chest: "106-111", waist: "91-96", hips: "106-111" },
  { size: "XL", chest: "116-121", waist: "101-106", hips: "116-121" },
  { size: "XXL", chest: "126-131", waist: "111-116", hips: "126-131" },
];

const SHOE_SIZES = [
  { size: "36", eu: "36", uk: "3.5", cm: "22.5" },
  { size: "37", eu: "37", uk: "4", cm: "23" },
  { size: "38", eu: "38", uk: "5", cm: "23.5" },
  { size: "39", eu: "39", uk: "5.5", cm: "24.5" },
  { size: "40", eu: "40", uk: "6.5", cm: "25" },
  { size: "41", eu: "41", uk: "7", cm: "25.5" },
  { size: "42", eu: "42", uk: "8", cm: "26.5" },
  { size: "43", eu: "43", uk: "9", cm: "27" },
  { size: "44", eu: "44", uk: "9.5", cm: "27.5" },
  { size: "45", eu: "45", uk: "10.5", cm: "28.5" },
];

const isShoeCategory = (category: string) => category === "shoes";

const SizeGuide = ({ category, children }: SizeGuideProps) => {
  const isShoe = isShoeCategory(category);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <button className="flex items-center gap-1 text-xs text-accent font-semibold hover:underline">
            <Ruler className="h-3 w-3" /> Size Guide
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-accent" />
            {isShoe ? "Shoe Size Guide" : "Clothing Size Guide"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {/* How to measure */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 mb-4">
            <p className="text-xs font-bold text-foreground mb-1">📏 How to Measure</p>
            {isShoe ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Place your foot on a piece of paper and trace around it. Measure the length from heel to toe in centimeters.
              </p>
            ) : (
              <ul className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
                <li>• <strong>Chest:</strong> Around the fullest part</li>
                <li>• <strong>Waist:</strong> Around the natural waistline</li>
                <li>• <strong>Hips:</strong> Around the widest part</li>
              </ul>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-secondary">
                  {isShoe ? (
                    <>
                      <th className="px-3 py-2.5 text-left font-bold">Size</th>
                      <th className="px-3 py-2.5 text-left font-bold">EU</th>
                      <th className="px-3 py-2.5 text-left font-bold">UK</th>
                      <th className="px-3 py-2.5 text-left font-bold">CM</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-2.5 text-left font-bold">Size</th>
                      <th className="px-3 py-2.5 text-left font-bold">Chest (cm)</th>
                      <th className="px-3 py-2.5 text-left font-bold">Waist (cm)</th>
                      <th className="px-3 py-2.5 text-left font-bold">Hips (cm)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isShoe
                  ? SHOE_SIZES.map((row, i) => (
                      <tr key={row.size} className={cn(i % 2 === 0 ? "bg-background" : "bg-secondary/50")}>
                        <td className="px-3 py-2 font-semibold">{row.size}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.eu}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.uk}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.cm}</td>
                      </tr>
                    ))
                  : CLOTHING_SIZES.map((row, i) => (
                      <tr key={row.size} className={cn(i % 2 === 0 ? "bg-background" : "bg-secondary/50")}>
                        <td className="px-3 py-2 font-semibold">{row.size}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.chest}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.waist}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.hips}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            Measurements are approximate. If between sizes, we recommend choosing the larger size.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuide;
