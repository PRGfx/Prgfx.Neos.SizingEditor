# Prgfx.Neos.SizingEditor

Provides inspector editor for sizing properties

`composer require prgfx/neos-sizingeditor`

## BoxModelEditor
```yaml
My.NodeType:
  properties:
    padding:
      type: array
      ui:
        inspector:
          # you can normally omit this, when you use array<string> as property type
          editor: Prgfx.Neos.BoxModelEditor
          editorOptions:
            # only allow editing one property for inline/block spacing
            lockInline: false
            lockBlock: false
            # optional limits per side, available as {inline,block}{Start,End}{Minimum,Maximum}
            # values outside the range are clamped when editing
            blockStartMinimum: 0
            blockStartMaximum: 200
            inlineEndMinimum: 0
```
Property returns 
```ts
{
  blockStart: number;
  blockEnd: number;
  inlineStart: number;
  inlineEnd: number;
}
```
