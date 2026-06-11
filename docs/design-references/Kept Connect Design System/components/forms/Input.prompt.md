The composer text field — large touch target, emerald focus ring, sentence-case label. Use `multiline` for descriptions; right-align + `tabular` for money.

```jsx
<Input label="What needs doing?" placeholder="Describe the job…" multiline />
<Input label="Your quote" prefix="$" align="right" tabular placeholder="0.00" />
```

Labels say what the person controls ("Post a job", not "Submit"). Focus draws the emerald border + soft halo.
