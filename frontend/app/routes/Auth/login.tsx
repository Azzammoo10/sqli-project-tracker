import { useState } from "react";
import { Link, redirect } from "react-router-dom";
import { Button } from "../../../components/Auth/button";
import { Input } from "../../../components/Auth/input";
import { Card, CardContent } from "../../../components/Auth/card";

import { Mail, Lock } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("username");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log("Login attempted with:", email, password);
        if (email === "admin" && password === "admin") {
            // Redirect to home page or perform successful login actions
            console.log("Login successful");
            redirect("/home");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
             style={{
                 background: "linear-gradient(135deg, #2a1b3d 0%, #44337a 50%, #6b46c1 100%)"
             }}>
            <Card className="w-full max-w-6xl overflow-hidden shadow-2xl">
                <div className="flex flex-col md:flex-row">
                    {/* Left Panel - Login Form */}
                    <div className="md:w-1/2 p-8 lg:p-12">
                        {/* Header */}
                        <div className="flex flex-col items-center justify-center mb-8">
                            <img
                                src="./assets/images/SQLI-LOGO.png"
                                alt="SQLI Logo"
                                className="h-16 object-contain mb-4"
                            />
                            <p className="text-sm text-muted-foreground">
                                Login into your account
                            </p>
                        </div>


                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Username
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text  "
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 bg-input border-border focus:ring-primary focus:border-primary"
                                        placeholder="azzm"
                                    />
                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12 bg-input border-border focus:ring-primary focus:border-primary"
                                        placeholder="Enter your password"
                                    />
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="text-right">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                                    >
                                        forgot password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base shadow-lg transition-all duration-200 hover:shadow-xl"
                                onClick={handleSubmit}
                            >
                                Login now
                            </Button>
                        </form>





                        {/* Signup Link */}
                        <div className="mt-8 pt-6 border-t border-border">
                            <Link to="/signup">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                >
                                    Signup now
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Panel - Illustration */}
                    <div className="md:w-1/2 bg-accent/20 flex items-center justify-center p-8 lg:p-12">
                        <div className="relative w-full max-w-md">
                            {/* Background Elements */}
                            <div className="absolute top-8 right-8 flex space-x-2">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                            </div>
                            <div className="absolute top-12 right-4 space-y-2">
                                <div className="w-16 h-2 bg-muted rounded"></div>
                                <div className="w-12 h-2 bg-muted rounded"></div>
                                <div className="w-20 h-2 bg-muted rounded"></div>
                            </div>

                            {/* Main Illustration */}
                            <div className="relative z-10 flex flex-col items-center">
                                <img
                                    src="./assets/images/undraw_security.png"
                                    alt="Security Illustration"
                                    className="w-full max-w-sm mx-auto"
                                />

                                {/* Security Badge */}
                                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                    <Lock className="w-10 h-10 text-primary-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Login;