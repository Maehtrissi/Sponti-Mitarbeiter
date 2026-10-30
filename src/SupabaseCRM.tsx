import CoursesCRM from './CoursesCRM';
import NewsCRM from './NewsCRM';
import FeaturedCourseCRM from './FeaturedCourseCRM';
import IndependentCRM from './IndependentCRM';
import AcquisitionCRM from './AcquisitionCRM';
import OperationsDashboard from './OperationsDashboard';
import {supabaseCRMRequest} from './lib/supabaseCRM';
export default function SupabaseCRM() {
  return <IndependentCRM request={supabaseCRMRequest} storageLabel="Supabase verbunden" allowImport={false} newsSection={<NewsCRM />} acquisitionSection={<AcquisitionCRM />} operationsSection={<OperationsDashboard />} featuredCourseSection={<FeaturedCourseCRM />} coursesSection={context=><CoursesCRM key={(context.providerId||'all')+(context.assign?'assign':'view')} initialProviderId={context.providerId} openNew={context.create} assignExisting={context.assign}/>}  />;
}
