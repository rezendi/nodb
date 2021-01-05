import slugify from 'slugify';
import sha256 from 'sha256';

const slugize = (str:string) => {
  return slugify(str, {lower: true, strict: true, locale: 'en'});
}

const hash8 = (str:string) => {
  return sha256(str).substring(0,8);
}

export default {
    slugize,
    hash8
}