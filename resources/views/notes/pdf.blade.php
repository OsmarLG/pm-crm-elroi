<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1,h2,h3 { margin-bottom: 6px; }
        ol { list-style: decimal; padding-left: 18px; }
        ul { list-style: disc; padding-left: 18px; }
        li { margin-bottom: 4px; }
        hr { margin: 12px 0; }
    </style>
</head>
<body>

<h1>{{ $note->title }}</h1>
<hr>

{!! \Illuminate\Support\Str::markdown($note->content) !!}

</body>
</html>
