/**
 * NotFound (404) Error Page Component
 * 
 * A dynamic 404 error page displayed when users navigate to
 * non-existent routes or resources.
 * 
 * @component
 * @example
 * ```tsx
 * // In your router configuration
 * <Route path="*" element={<NotFound />} />
 * 
 * // Or as a catch-all route
 * <Route path="/404" element={<NotFound />} />
 * ```
 * 
 * Features:
 * - Friendly, engaging error message
 * - Navigation options (home, back)
 * - Helpful suggestions for users
 * - Support contact options
 * - Responsive gradient design
 * - SEO-friendly structure
 * 
 * Customization:
 * - Update support email addresses
 * - Modify suggested actions list
 * - Add search functionality
 * - Integrate with analytics to track 404s
 * - Customize messaging tone to match brand
 * - Add popular pages or sitemap links
 */
import React from "react";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";



const NotFound: React.FC = () => {
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-xl opacity-70"></div>
                        <div className="relative rounded-full bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                            <SearchX className="h-20 w-20 text-gradient bg-gradient-to-r from-blue-600 to-purple-600" />
                        </div>
                    </div>
          
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            404
                    </h1>
          
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Page Not Found
                    </h2>
          
                    <p className="text-gray-600 mb-8 text-lg">
            Oops! The page you're looking for seems to have wandered off into the digital void.
                    </p>

                    <div className="w-full max-w-xs space-y-4">
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
                    </div>

                    {/* Helpful Suggestions Section - Customize based on common user scenarios */}
                    <div className="mt-12 pt-8 border-t border-gray-200 w-full">
                        <h3 className="font-medium text-gray-700 mb-4">What might have happened?</h3>
                        <ul className="text-left text-gray-600 space-y-2">
                            <li className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                                <span>The page may have been moved or deleted</span>
                            </li>
                            <li className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                                <span>You might have typed the URL incorrectly</span>
                            </li>
                            <li className="flex items-start">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                                <span>The link you followed might be outdated</span>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links - Update email addresses to match your support system */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
              Refresh Page
                        </button>
                        <span className="text-gray-300">•</span>
                        {/* TODO: Replace with your support email */}
                        <button
                            onClick={() => window.open("mailto:support@example.com", "_blank")}
                            className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                        >
              Contact Support
                        </button>
                        <span className="text-gray-300">•</span>
                        {/* TODO: Integrate with issue tracking system */}
                        <button
                            onClick={() => window.open("mailto:support@example.com?subject=Page Not Found Issue", "_blank")}
                            className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                        >
              Report Issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;