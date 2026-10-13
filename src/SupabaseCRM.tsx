import CoursesCRM from './CoursesCRM';
import NewsCRM from './NewsCRM';
import IndependentCRM from './IndependentCRM';
import {supabaseCRMRequest} from './lib/supabaseCRM';
export default function SupabaseCRM() {
  return <IndependentCRM request={supabaseCRMRequest} storageLabel="Supabase verbunden" allowImport={false} newsSection={<NewsCRM />} coursesSection={context=><CoursesCRM key={(context.providerId||'all')+(context.assign?'assign':'view')} initialProviderId={context.providerId} openNew={context.create} assignExisting={context.assign}/>}  />;
}
