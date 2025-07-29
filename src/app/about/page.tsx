
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Landmark, Mail } from 'lucide-react';
import LeavesEffect from '@/components/layout/LeavesEffect';

export default function AboutPage() {
  return (
    <div className="min-h-screen relative bg-transparent">
      <LeavesEffect />
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4">
            About Our Family
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            A brief look into the roots, stories, and people that define us.
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <span>Our History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
              Our family tree traces its roots back to Kutty Maamu, our great-great-grandfather, whose strength and legacy planted the seeds of what we now proudly call the Unity Valiyangadi family. 
              Rooted in the heart of Kerala, India, our journey spans generations of love, tradition, and resilience. From the quiet lanes of Valiyangadi to families now spread across the world, this space is a tribute to where we come from — and who we are. 
              This website is not just about history — it's about connection. A place for stories, memories, and new bonds to grow. While we may not have every name or photo yet, each contribution adds a leaf to our ever-growing tree.
              We are many, yet we are one. Bound by shared heritage and the legacy of those who came before us, we carry their spirit forward.
              Let this tree grow — with your stories, your memories, and your voice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Landmark className="h-6 w-6 text-primary" />
                <span>Key Milestones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground space-y-2">
              Every great tree starts with unseen roots.  
              Our milestones will bloom here with time.
              </p>

              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                {/* <li><strong>1921:</strong> Marco and Sofia arrive in America.</li> */}
                {/*<li><strong>1955:</strong> The first family reunion is held.</li>*/}
                {/*<li><strong>1980:</strong> The family business, "Vance & Sons," opens.</li>*/}
                {/*<li><strong>2005:</strong> 100th family member is born.</li>*/}
                {/*<li><strong>Today:</strong> Our story continues with you.</li>*/}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-primary" />
                <span>Contact & Connect</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Have a story to share, a photo to add, or a question to ask? We'd love to hear from you. Reach out to the family historian for contributions or inquiries.
              </p>
              <a
                href="mailto:memelove@techie.com"
                className="text-primary font-semibold hover:underline mt-4 inline-block"
              >
                memelove@techie.com
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
