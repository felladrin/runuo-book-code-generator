<?php
$filename = $_POST['file'] . ".cs";
$file = fopen("./temp/$filename", 'w'); 
fwrite($file, stripslashes($_POST['thecode']));
fclose($file);
header('Content-disposition: attachment; filename=' . $filename);
header('Content-type: application/cs');
readfile("./temp/$filename");
unlink("./temp/$filename");
?> 
