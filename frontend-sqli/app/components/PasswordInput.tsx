// components/PasswordInput.tsx
import { useMemo, useState } from "react";
import { Lock, Eye, EyeOff, Wand2, Clipboard } from "lucide-react";
import { generateStrongPassword, isBackendValid, scorePassword } from "../utils/password";
import toast from "react-hot-toast";

type Props = {
    id?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export default function PasswordInput({
                                          id = "motDePasse",
                                          name = "motDePasse",
                                          value,
                                          onChange,
                                          placeholder = "Mot de passe",
                                          className = "",
                                      }: Props) {
    const [visible, setVisible] = useState(false);

    const { score, label } = useMemo(() => scorePassword(value), [value]);
    const valid = useMemo(() => isBackendValid(value), [value]);

    const generate = () => {
        const pwd = generateStrongPassword(14);
        onChange(pwd);
        toast.success("Mot de passe fort généré");
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Mot de passe copié");
        } catch {
            toast.error("Impossible de copier");
        }
    };

    return (
        <div>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                </div>

                <input
                    id={id}
                    name={name}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required
                    className={`block w-full pl-10 pr-28 py-3 border border-gray-300 rounded-lg
                      text-gray-900 placeholder:text-gray-500 focus:outline-none
                      focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent ${className}`}
                    aria-describedby={`${id}-help ${id}-meter`}
                />

                {/* Boutons actions */}
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={generate}
                        title="Générer un mot de passe fort"
                        className="p-2 rounded-md hover:bg-gray-100"
                    >
                        <Wand2 className="h-5 w-5 text-[#4B2A7B]" />
                    </button>

                    <button
                        type="button"
                        onClick={copy}
                        title="Copier"
                        className="p-2 rounded-md hover:bg-gray-100"
                        disabled={!value}
                    >
                        <Clipboard className="h-5 w-5 text-gray-700" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setVisible(v => !v)}
                        title={visible ? "Masquer" : "Afficher"}
                        className="p-2 rounded-md hover:bg-gray-100"
                    >
                        {visible ? <EyeOff className="h-5 w-5 text-gray-700" /> : <Eye className="h-5 w-5 text-gray-700" />}
                    </button>
                </div>
            </div>

            {/* Barre de force */}
            <div id={`${id}-meter`} className="mt-2">
                <div className="h-2 w-full bg-gray-100 rounded">
                    <div
                        className={`h-2 rounded transition-all ${
                            score === 0 ? "bg-rose-500 w-1/4"
                                : score === 1 ? "bg-amber-500 w-2/4"
                                    : score === 2 ? "bg-emerald-500 w-3/4"
                                        : "bg-emerald-600 w-full"
                        }`}
                    />
                </div>
                <div className="mt-1 text-xs flex items-center justify-between">
                    <span className="text-gray-600">Force : <strong>{label}</strong></span>
                    <span className={valid ? "text-emerald-600" : "text-gray-500"}>
            {valid ? "Conforme à la politique serveur" : "Min 10, a-z, A-Z, 0-9, @$!%*?&"}
          </span>
                </div>
            </div>
        </div>
    );
}
