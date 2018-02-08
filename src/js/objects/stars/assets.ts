import { WEBGL_DIR } from '../../constants';
import Asset from '../../utils/loading/asset';
import { WEBGL_TEXTURE } from '../../utils/loading/constants';

export default [
  new Asset({
    id: 'lensflare_alpha',
    src: `${WEBGL_DIR}images/lensflare_alpha.png`,
    type: WEBGL_TEXTURE
  }),
];
