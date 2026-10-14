import manifest from '@neos-project/neos-ui-extensibility';
import { BoxModelEditor } from './BoxModelEditor';

manifest('Prgfx.Neos.SizingEditor:BoxModelEditor', {}, (globalRegistry) => {
    const editorRegistry = globalRegistry.get('inspector').get('editors');
    editorRegistry.set('Prgfx.Neos.BoxModelEditor', {
        component: BoxModelEditor,
    });
});
