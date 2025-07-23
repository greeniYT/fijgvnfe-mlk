<?php
$R = false; 
$K = array('36e8f637bf3233a3abac6ee88a56913e','1eededeff88d74dd1937c4b98a1e39fe');
if (in_array($_GET['k'], $K)) 
{
	$R = true;
}
echo $R;
?>