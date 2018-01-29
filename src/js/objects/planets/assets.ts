import { WEBGL_DIR } from '../../constants';
import Asset from '../../utils/loading/asset';
import { IMAGE, JSON, WEBGL_TEXTURE } from '../../utils/loading/constants';

export default [
  new Asset({
    id: 'texture',
    src: `${WEBGL_DIR}images/earth-map.jpg`,
    type: WEBGL_TEXTURE
  })
];
