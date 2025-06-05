import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Users, Briefcase } from 'lucide-react';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

interface WorkplaceReviewsProps {
  businessData: BusinessData;
}

const WorkplaceReviews: React.FC<WorkplaceReviewsProps> = ({ businessData }) => {
  const workplaceData = {
    kununu: {
      rating: 3.8,
      reviews: 23,
      categories: {
        arbeitsatmosphaere: 4.1,
        vorgesetztenverhalten: 3.6,
        kollegenzusammenhalt: 4.2,
        arbeitszeiten: 3.9,
        gehaltZufriedenheit: 3.4
      }
    },
    glassdoor: {
      rating: 3.9,
      reviews: 12,
      wouldRecommend: 78
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Arbeitgeberbewertungen
          </CardTitle>
          <CardDescription>
            Bewertungen als Arbeitgeber auf verschiedenen Plattformen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">kununu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{workplaceData.kununu.rating}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-5 w-5 ${i <= workplaceData.kununu.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{workplaceData.kununu.reviews} Bewertungen</p>
                  
                  <div className="space-y-3">
                    {Object.entries(workplaceData.kununu.categories).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span>{value}</span>
                        </div>
                        <Progress value={value * 20} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Glassdoor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{workplaceData.glassdoor.rating}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-5 w-5 ${i <= workplaceData.glassdoor.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{workplaceData.glassdoor.reviews} Bewertungen</p>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Empfehlungsrate</span>
                      <span>{workplaceData.glassdoor.wouldRecommend}%</span>
                    </div>
                    <Progress value={workplaceData.glassdoor.wouldRecommend} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkplaceReviews;
