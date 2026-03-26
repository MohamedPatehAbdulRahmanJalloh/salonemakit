import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, MapPin, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryFormProps {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  phoneError: string;
  districts: string[];
  districtLabel: string;
}

const DeliveryForm = ({ name, setName, phone, setPhone, district, setDistrict, address, setAddress, phoneError, districts, districtLabel }: DeliveryFormProps) => (
  <section className="space-y-2.5">
    <h2 className="text-xs font-bold flex items-center gap-1.5">
      <Truck className="h-3.5 w-3.5 text-accent" /> Delivery Information
    </h2>
    <div className="relative">
      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9 bg-secondary border-none h-11 rounded-lg text-sm" />
    </div>
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder={`Phone`} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className={cn("pl-9 bg-secondary border-none h-11 rounded-lg text-sm", phoneError && "ring-2 ring-destructive")} />
      {phoneError && <p className="text-[10px] text-destructive mt-0.5 pl-1">{phoneError}</p>}
    </div>
    <Select value={district} onValueChange={setDistrict}>
      <SelectTrigger className="bg-secondary border-none h-11 rounded-lg text-sm">
        <SelectValue placeholder={districtLabel} />
      </SelectTrigger>
      <SelectContent>
        {districts.map((d) => (
          <SelectItem key={d} value={d}>{d}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-9 bg-secondary border-none h-11 rounded-lg text-sm" />
    </div>
  </section>
);

export default DeliveryForm;
