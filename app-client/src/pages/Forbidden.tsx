/**
 * Forbidden (403) Error Page Component
 * 
 * A dynamic 403 error page displayed when users attempt to access
 * resources they don't have permission to view.
 * 
 * @component
 * @example
 * ```tsx
 * // In your router configuration
 * <Route path="/forbidden" element={<Forbidden />} />
 * 
 * // Or programmatically navigate
 * navigate('/forbidden');
 * ```
 * 
 * Features:
 * - Clear visual indication of access denial
 * - Multiple navigation options (home, back, request access)
 * - Informative reasons for access denial
 * - Contact admin functionality
 * - Links to login/register pages
 * - Responsive gradient design
 * 
 * Customization:
 * - Update admin email in handleContactAdmin()
 * - Modify navigation paths for login/register
 * - Customize reasons list based on your app's permissions
 * - Add analytics tracking for forbidden access attempts
 * - Integrate with your authentication system
 */
import React from "react";
import { Home, ShieldAlert, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";



const Forbidden: React.FC = () => {
    const navigate = useNavigate();

    /**
     * Navigate to home page
     */
    const handleGoHome = () => {
        navigate("/");
    };

    /**
     * Navigate to previous page in history
     */
    const handleGoBack = () => {
        navigate(-1);
    };

    /**
     * Open email client to request access from admin
     * TODO: Replace with your admin email or support system
     */
    const handleContactAdmin = () => {
        window.open("mailto:admin@example.com?subject=Access Request", "_blank");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-orange-100 rounded-full blur-xl opacity-70"></div>
                        <div className="relative rounded-full bg-gradient-to-r from-red-50 to-orange-50 p-6">
                            <div className="relative">
                                <ShieldAlert className="h-20 w-20 text-gradient bg-gradient-to-r from-red-600 to-orange-600" />
                                <Lock className="h-10 w-10 text-red-500 absolute -bottom-2 -right-2" />
                            </div>
                        </div>
                    </div>
          
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            403
                    </h1>
          
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Access Forbidden
                    </h2>
          
                    <p className="text-gray-600 mb-6 text-lg">
            You don't have permission to access this page or resource.
                    </p>

                    <div className="w-full max-w-xs space-y-4 mb-8">
                        <Button
                            onClick={handleGoHome}
                            size="lg"
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Home className="h-5 w-5" />
              Go to Homepage
                        </Button>
            
                        <Button
                            onClick={handleGoBack}
                            variant="outline"
                            size="lg"
                            className="w-full flex items-center justify-center gap-3 border-2 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                        >
                            <ArrowLeft className="h-5 w-5" />
              Go Back
                        </Button>

                        <Button
                            onClick={handleContactAdmin}
                            variant="outline"
                            size="lg"
                            className="w-full flex items-center justify-center gap-3 border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                        >
                            <ShieldAlert className="h-5 w-5" />
              Request Access
                        </Button>
                    </div>

                    {/* Possible Reasons Section - Customize based on your app's permission model */}
                    <div className="mt-8 pt-8 border-t border-gray-200 w-full">
                        <h3 className="font-medium text-gray-700 mb-4">Possible reasons:</h3>
                        <ul className="text-left text-gray-600 space-y-3">
                            <li className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-red-500 mt-2 mr-3"></div>
                                <div>
                                    <span className="font-medium">Insufficient permissions</span>
                                    <p className="text-sm text-gray-500 mt-1">Your account doesn't have the required access level</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-red-500 mt-2 mr-3"></div>
                                <div>
                                    <span className="font-medium">Restricted content</span>
                                    <p className="text-sm text-gray-500 mt-1">This page is only available to specific users or roles</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-red-500 mt-2 mr-3"></div>
                                <div>
                                    <span className="font-medium">Authentication required</span>
                                    <p className="text-sm text-gray-500 mt-1">You may need to log in with different credentials</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2">Need help?</h4>
                        <p className="text-sm text-blue-600">
              If you believe this is an error or need access to this resource, 
              please contact your system administrator or the support team.
                        </p>
                    </div>

                    {/* Authentication Links - Update paths to match your routes */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
                        <span className="text-gray-500">Already have an account?</span>
                        <button
                            onClick={() => navigate("/login")}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
              Sign In
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                            onClick={() => navigate("/register")}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
              Create Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;