import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Volume2, Music, Headphones } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Music className="w-4 h-4 text-black" />
          </div>
          <span className="text-xl font-bold text-white">TranceForge</span>
        </div>
        <Button 
          onClick={() => window.location.href = '/api/login'}
          className="bg-accent hover:bg-accent/80 text-black font-medium"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Create Epic
            <span className="text-accent"> Trance</span>
            <br />
            Music in Your Browser
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Professional music production meets simplicity. Build trance and house tracks 
            with our powerful sequencer, sample library, and mixing tools.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-accent hover:bg-accent/80 text-black font-medium text-lg px-8 py-3"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Creating Music
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Volume2 className="w-8 h-8 text-accent mb-2" />
              <CardTitle className="text-white">Professional Samples</CardTitle>
              <CardDescription className="text-gray-400">
                1000+ high-quality trance and house samples categorized by drums, bass, leads, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Play className="w-8 h-8 text-accent mb-2" />
              <CardTitle className="text-white">Step Sequencer</CardTitle>
              <CardDescription className="text-gray-400">
                Intuitive drag-and-drop sequencer with up to 64 steps for complex pattern creation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Headphones className="w-8 h-8 text-accent mb-2" />
              <CardTitle className="text-white">Multi-Track Mixer</CardTitle>
              <CardDescription className="text-gray-400">
                Professional mixing console with volume, pan, EQ, and effects controls for each track
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Make Music?
            </h2>
            <p className="text-gray-300 mb-6">
              Join thousands of producers creating amazing trance and house music. 
              No downloads required - everything runs in your browser.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-accent hover:bg-accent/80 text-black font-medium"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}