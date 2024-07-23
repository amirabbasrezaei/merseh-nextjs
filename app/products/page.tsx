import { permanentRedirect } from 'next/navigation'

 
export default  async function Page() {

  permanentRedirect(`/category/1/همه`) // Navigate to the new user profile
}

