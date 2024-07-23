import { permanentRedirect } from 'next/navigation'

 
export default async function prodile() {

  permanentRedirect(`/category/1`) // Navigate to the new user profile
}