import IndependentCRM from './IndependentCRM';
import {supabaseCRMRequest} from './lib/supabaseCRM';
export default function SupabaseCRM() {
  return <IndependentCRM request={supabaseCRMRequest} storageLabel="Supabase verbunden" allowImport={false} />;
}
